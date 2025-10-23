"""
API routes for the chatbot with streaming support
"""
from flask import jsonify, request, send_from_directory, Response, stream_with_context, session
from flask_wtf.csrf import generate_csrf
from pydantic import ValidationError
from app.llm_service import LLMService
from app.models import ChatRequest
from app.aveena_receptionist import get_aveena_system_message, get_aveena_config
from app.knowledge_base import get_company_knowledge, should_include_knowledge
import logging
import json

logger = logging.getLogger(__name__)

def init_app(app, limiter):
    """Initialize routes with app and limiter"""

    # Initialize LLM service
    llm_service = LLMService(app.config)

    # SECURITY: Add Cache-Control and Security headers to all responses
    @app.after_request
    def add_security_headers(response):
        """Add security headers to all responses"""
        # Cache Control for API responses
        if request.path.startswith('/api/'):
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'

        # Security Headers (all responses)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['X-XSS-Protection'] = '1; mode=block'

        # Strict-Transport-Security (only if HTTPS enabled)
        if app.config.get('FORCE_HTTPS'):
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

        # Permissions Policy (restrict browser features)
        response.headers['Permissions-Policy'] = (
            'geolocation=(), microphone=(), camera=(), '
            'payment=(), usb=(), magnetometer=(), gyroscope=()'
        )

        return response

    # Serve PWA frontend
    @app.route('/')
    def index():
        if app.static_folder:
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({'message': 'Frontend not built yet. Run: cd frontend && npm run build'}), 404

    @app.route('/<path:path>')
    def serve_static(path):
        if app.static_folder:
            try:
                return send_from_directory(app.static_folder, path)
            except:
                # SPA fallback - serve index.html for unknown routes
                return send_from_directory(app.static_folder, 'index.html')
        return jsonify({'error': 'Frontend not available'}), 404

    # Health check (no rate limit - used for monitoring)
    @app.route('/api/health')
    @limiter.exempt
    def health():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'version': '1.0.0',
            'services': {
                'openai': llm_service.openai_client is not None,
                'claude': llm_service.anthropic_client is not None
            }
        })

    # CSRF token endpoint (no rate limit - needed for initialization)
    @app.route('/api/csrf-token')
    @limiter.exempt
    def csrf_token():
        """Get CSRF token for client-side requests"""
        token = generate_csrf()
        return jsonify({'csrf_token': token})

    # Chat endpoint (non-streaming)
    @app.route('/api/chat', methods=['POST'])
    @limiter.limit("10 per minute")
    def chat():
        """
        Main chat endpoint
        POST /api/chat
        {
            "message": "user message",
            "provider": "openai|claude",
            "model": "gpt-4|claude-3-sonnet",
            "history": [{"role": "user", "content": "..."}]
        }
        """
        try:
            # Validate input with Pydantic
            try:
                req_data = ChatRequest.model_validate(request.get_json())
            except ValidationError as e:
                return jsonify({
                    'error': 'Invalid input',
                    'details': e.errors()
                }), 400

            user_message = req_data.message
            provider = req_data.provider
            model = req_data.model
            history = [msg.model_dump() for msg in req_data.history] if req_data.history else []

            # Build conversation
            conversation = history + [{"role": "user", "content": user_message}]

            # Add Aveena's system message if not present
            if not any(msg['role'] == 'system' for msg in conversation):
                system_message = get_aveena_system_message()
                
                # Include company knowledge if the message is about the company
                if should_include_knowledge(user_message):
                    system_message += "\n\n" + get_company_knowledge()
                
                conversation = [
                    {"role": "system", "content": system_message}
                ] + conversation

            # Call appropriate LLM
            if provider == 'claude':
                result = llm_service.chat_claude(conversation, model=model, stream=False)
            else:
                result = llm_service.chat_openai(conversation, model=model, stream=False)

            if result.get('success'):
                logger.info(f"Chat successful: provider={provider}, tokens={result.get('usage', {}).get('total_tokens', 'N/A')}")
                return jsonify({
                    'message': result['message'],
                    'model': result['model'],
                    'usage': result.get('usage')
                })
            else:
                logger.error(f"LLM error: {result.get('error')}")
                return jsonify({'error': 'Failed to get response from AI'}), 500

        except Exception as e:
            logger.error(f"Chat error: {str(e)}", exc_info=True)
            return jsonify({'error': 'Internal server error'}), 500

    # Chat endpoint (streaming)
    @app.route('/api/chat/stream', methods=['POST'])
    @limiter.limit("10 per minute")
    def chat_stream():
        """
        Streaming chat endpoint
        POST /api/chat/stream
        Returns Server-Sent Events (SSE)
        """
        try:
            # Validate input with Pydantic
            try:
                req_data = ChatRequest.model_validate(request.get_json())
            except ValidationError as e:
                return jsonify({
                    'error': 'Invalid input',
                    'details': e.errors()
                }), 400

            user_message = req_data.message
            provider = req_data.provider
            model = req_data.model
            history = [msg.model_dump() for msg in req_data.history] if req_data.history else []

            # Build conversation
            conversation = history + [{"role": "user", "content": user_message}]

            # Add Aveena's system message if not present
            if not any(msg['role'] == 'system' for msg in conversation):
                system_message = get_aveena_system_message()
                
                # Include company knowledge if the message is about the company
                if should_include_knowledge(user_message):
                    system_message += "\n\n" + get_company_knowledge()
                
                conversation = [
                    {"role": "system", "content": system_message}
                ] + conversation

            # Create streaming response
            def generate():
                try:
                    if provider == 'claude':
                        stream = llm_service.chat_claude(conversation, model=model, stream=True)
                    else:
                        stream = llm_service.chat_openai(conversation, model=model, stream=True)

                    for chunk in stream:
                        # Send as Server-Sent Event
                        yield f"data: {json.dumps(chunk)}\n\n"

                except Exception as e:
                    logger.error(f"Streaming error: {str(e)}")
                    yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

            logger.info(f"Starting stream: provider={provider}, model={model}")

            return Response(
                stream_with_context(generate()),
                mimetype='text/event-stream',
                headers={
                    'Cache-Control': 'no-cache',
                    'X-Accel-Buffering': 'no',
                    'Connection': 'keep-alive'
                }
            )

        except Exception as e:
            logger.error(f"Stream setup error: {str(e)}", exc_info=True)
            return jsonify({'error': 'Internal server error'}), 500

    # List available models
    @app.route('/api/models')
    def list_models():
        """List available LLM models"""
        return jsonify({
            'openai': [
                {'id': 'gpt-4', 'name': 'GPT-4', 'available': llm_service.openai_client is not None},
                {'id': 'gpt-4-turbo-preview', 'name': 'GPT-4 Turbo', 'available': llm_service.openai_client is not None},
                {'id': 'gpt-3.5-turbo', 'name': 'GPT-3.5 Turbo', 'available': llm_service.openai_client is not None}
            ],
            'claude': [
                {'id': 'claude-3-5-sonnet-20241022', 'name': 'Claude 3.5 Sonnet', 'available': llm_service.anthropic_client is not None},
                {'id': 'claude-3-opus-20240229', 'name': 'Claude 3 Opus', 'available': llm_service.anthropic_client is not None},
                {'id': 'claude-3-sonnet-20240229', 'name': 'Claude 3 Sonnet', 'available': llm_service.anthropic_client is not None}
            ]
        })

    # Rate limit info
    @app.route('/api/rate-limit')
    def rate_limit_info():
        """Get current rate limit status"""
        return jsonify({
            'limits': {
                'per_minute': app.config['RATELIMIT_PER_MINUTE'],
                'per_hour': app.config['RATELIMIT_PER_HOUR'],
                'per_day': app.config['RATELIMIT_PER_DAY']
            }
        })

    # Error handlers
    @app.errorhandler(400)
    def bad_request(e):
        """Handle bad request errors"""
        logger.warning(f"Bad request from {request.remote_addr}: {str(e)}")
        return jsonify({
            'error': 'Bad request',
            'message': str(e) if app.config.get('DEBUG') else 'Invalid request format.'
        }), 400

    @app.errorhandler(401)
    def unauthorized(e):
        """Handle unauthorized errors"""
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication required.'
        }), 401

    @app.errorhandler(403)
    def forbidden(e):
        """Handle forbidden errors"""
        logger.warning(f"Forbidden access attempt from {request.remote_addr}")
        return jsonify({
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource.'
        }), 403

    @app.errorhandler(404)
    def not_found(e):
        """Handle not found errors"""
        return jsonify({
            'error': 'Not found',
            'message': 'The requested resource was not found.'
        }), 404

    @app.errorhandler(429)
    def ratelimit_handler(e):
        """Handle rate limit errors"""
        logger.warning(f"Rate limit exceeded: {request.remote_addr}")
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.'
        }), 429

    @app.errorhandler(500)
    def internal_error(e):
        """Handle internal server errors"""
        logger.error(f"Internal error: {str(e)}", exc_info=True)
        # Never expose internal error details to clients
        return jsonify({
            'error': 'Internal server error',
            'message': 'Something went wrong. Please try again.'
        }), 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        """Catch-all for unexpected errors"""
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        # Never expose stack traces or internal details
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred. Please try again.'
        }), 500

    # Monitoring endpoints
    @app.route('/api/metrics', methods=['POST', 'OPTIONS'])
    def receive_metrics():
        """Receive frontend performance metrics"""
        if request.method == 'OPTIONS':
            return '', 200

        try:
            metrics = request.get_json()
            # Log metrics (in production, send to monitoring service)
            logger.info(f"Frontend metrics: {json.dumps(metrics)}")
            return jsonify({'status': 'received'}), 200
        except Exception as e:
            logger.error(f"Metrics error: {str(e)}")
            return jsonify({'error': 'Failed to process metrics'}), 500

    @app.route('/api/errors/critical', methods=['POST', 'OPTIONS'])
    def receive_errors():
        """Receive frontend critical errors"""
        if request.method == 'OPTIONS':
            return '', 200

        try:
            error_data = request.get_json()
            # Log errors (in production, send to error tracking service like Sentry)
            logger.error(f"Frontend critical error: {json.dumps(error_data)}")
            return jsonify({'status': 'logged'}), 200
        except Exception as e:
            logger.error(f"Error logging failed: {str(e)}")
            return jsonify({'error': 'Failed to log error'}), 500
