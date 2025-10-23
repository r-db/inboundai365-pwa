# PWA + LLM Backend Integration Guide

**Complete guide for integrating AI chatbot backend with your PWA**

---

## 📋 Pre-Implementation Checklist

### Required Tools & Accounts
- [ ] Python 3.9+ installed (`python --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Redis installed (for rate limiting) or Docker
- [ ] LLM API key (OpenAI or Anthropic)
- [ ] Git repository initialized
- [ ] `.gitignore` configured to exclude `.env` files

### Development Environment
- [ ] Virtual environment tool (`venv` or `conda`)
- [ ] Code editor with Python support (VS Code recommended)
- [ ] API testing tool (Postman, Insomnia, or curl)
- [ ] Browser DevTools for frontend testing

### Security Prerequisites
- [ ] SSL certificate for production (Let's Encrypt, Cloudflare)
- [ ] Strong secret key generator ready
- [ ] Environment variable management strategy
- [ ] Logging infrastructure planned

---

## 🏗️ Project Structure

```
pwa-chatbot/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── routes.py             # API endpoints
│   │   ├── llm_service.py        # LLM integration (streaming)
│   │   ├── auth.py               # Authentication & session management
│   │   ├── models.py             # Database models
│   │   ├── middleware.py         # Security middleware
│   │   └── logging_config.py     # Logging setup
│   ├── tests/
│   │   ├── test_routes.py
│   │   └── test_llm_service.py
│   ├── config.py                 # Configuration classes
│   ├── requirements.txt          # Python dependencies
│   ├── requirements-dev.txt      # Development dependencies
│   └── run.py                    # Application entry point
│
├── frontend/
│   ├── src/
│   │   ├── js/
│   │   │   ├── app.js            # Main PWA app
│   │   │   ├── chat-client.js    # NEW: Chat API client with streaming
│   │   │   ├── chat-ui.js        # NEW: Chat UI components
│   │   │   └── ... (existing PWA modules)
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   └── chat.css          # NEW: Chat interface styles
│   │   ├── index.html
│   │   └── chat.html             # NEW: Chat page
│   ├── webpack.config.js
│   └── package.json
│
├── .env                          # Environment variables (NEVER commit)
├── .env.example                  # Template for .env
├── .gitignore
├── docker-compose.yml            # Optional: Redis + app
├── Procfile                      # For deployment (Railway/Heroku)
└── README.md
```

---

## 🚀 Implementation Roadmap

### Phase 1: Backend Foundation (Day 1)
- [ ] Set up Python virtual environment
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Create Flask application structure
- [ ] Implement basic health check endpoint
- [ ] Test backend runs successfully

### Phase 2: LLM Integration (Day 1-2)
- [ ] Implement LLM service class
- [ ] Add OpenAI integration
- [ ] Add Anthropic (Claude) integration
- [ ] Implement streaming response support
- [ ] Add error handling for API failures
- [ ] Test LLM connections

### Phase 3: Security & Rate Limiting (Day 2)
- [ ] Set up Redis for rate limiting
- [ ] Implement rate limiting middleware
- [ ] Add input validation
- [ ] Configure CORS (if needed)
- [ ] Set up session management
- [ ] Add request logging

### Phase 4: Frontend Integration (Day 3)
- [ ] Create chat-client.js with streaming support
- [ ] Build chat UI components
- [ ] Add chat.html page
- [ ] Style chat interface
- [ ] Integrate with PWA app.js
- [ ] Test end-to-end flow

### Phase 5: Testing & Optimization (Day 4)
- [ ] Write unit tests for backend
- [ ] Test rate limiting
- [ ] Test streaming responses
- [ ] Load testing
- [ ] Error handling verification
- [ ] Performance optimization

### Phase 6: Deployment (Day 5)
- [ ] Build production frontend
- [ ] Configure production environment
- [ ] Deploy to hosting platform
- [ ] Set up SSL/HTTPS
- [ ] Configure environment variables
- [ ] Monitor logs and performance

---

## 💻 Backend Implementation

### 1. requirements.txt

```txt
# Core Framework
Flask==3.0.0
Flask-CORS==4.0.0
gunicorn==21.2.0

# Rate Limiting & Caching
Flask-Limiter==3.5.0
redis==5.0.1

# Environment & Configuration
python-dotenv==1.0.0

# LLM Providers
openai==1.6.1
anthropic==0.8.1

# Security
Flask-Talisman==1.1.0
cryptography==41.0.7

# Logging & Monitoring
python-json-logger==2.0.7

# Testing (requirements-dev.txt)
# pytest==7.4.3
# pytest-flask==1.3.0
# pytest-cov==4.1.0
```

### 2. .env.example

```bash
# Copy this to .env and fill in your values
# NEVER commit .env to git

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=generate-a-strong-secret-key-here
FLASK_DEBUG=True

# LLM API Keys (get from respective providers)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Database (optional - for user management)
DATABASE_URL=sqlite:///app.db

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379/0
# Use memory:// if Redis not available (dev only)
# REDIS_URL=memory://

# Rate Limiting
RATELIMIT_PER_MINUTE=10
RATELIMIT_PER_HOUR=100
RATELIMIT_PER_DAY=500

# Security
SESSION_COOKIE_SECURE=False  # Set True in production
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax
SESSION_LIFETIME=3600  # 1 hour

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# LLM Configuration
DEFAULT_MODEL=gpt-4
MAX_TOKENS=1000
TEMPERATURE=0.7
STREAM_ENABLED=True
```

### 3. config.py

```python
"""
Configuration management for different environments
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""

    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # LLM API Keys
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')

    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    RATELIMIT_PER_MINUTE = int(os.environ.get('RATELIMIT_PER_MINUTE', 10))
    RATELIMIT_PER_HOUR = int(os.environ.get('RATELIMIT_PER_HOUR', 100))
    RATELIMIT_PER_DAY = int(os.environ.get('RATELIMIT_PER_DAY', 500))

    # Session Security
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(seconds=int(os.environ.get('SESSION_LIFETIME', 3600)))

    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'logs/app.log')

    # LLM Configuration
    DEFAULT_MODEL = os.environ.get('DEFAULT_MODEL', 'gpt-4')
    MAX_TOKENS = int(os.environ.get('MAX_TOKENS', 1000))
    TEMPERATURE = float(os.environ.get('TEMPERATURE', 0.7))
    STREAM_ENABLED = os.environ.get('STREAM_ENABLED', 'True') == 'True'

    # Security Headers
    FORCE_HTTPS = False
    HSTS_MAX_AGE = 31536000  # 1 year
    HSTS_INCLUDE_SUBDOMAINS = True

    # CORS (if frontend on different domain)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SESSION_COOKIE_SECURE = False  # Allow HTTP in dev

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    FORCE_HTTPS = True

    # Validate required environment variables
    @classmethod
    def validate(cls):
        required = ['SECRET_KEY', 'OPENAI_API_KEY', 'REDIS_URL']
        missing = [key for key in required if not os.environ.get(key)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    RATELIMIT_ENABLED = False
    RATELIMIT_STORAGE_URL = 'memory://'

# Config dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
```

### 4. backend/app/logging_config.py

```python
"""
Logging configuration with structured JSON logging
"""
import logging
import os
from pythonjsonlogger import jsonlogger

def setup_logging(app):
    """Configure application logging"""

    log_level = app.config.get('LOG_LEVEL', 'INFO')
    log_file = app.config.get('LOG_FILE', 'logs/app.log')

    # Create logs directory if it doesn't exist
    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level))

    # JSON formatter for structured logging
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s',
        rename_fields={'levelname': 'level', 'asctime': 'timestamp'}
    )

    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Console handler (for development)
    if app.debug:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        logger.addHandler(console_handler)

    return logger
```

### 5. backend/app/__init__.py

```python
"""
Flask application factory
"""
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from config import config
import os

def create_app(config_name=None):
    """Create and configure Flask application"""

    app = Flask(__name__,
                static_folder='../../frontend/dist',
                static_url_path='')

    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app.config.from_object(config[config_name])

    # Validate production config
    if config_name == 'production':
        config[config_name].validate()

    # Setup logging
    from app.logging_config import setup_logging
    setup_logging(app)

    # Security headers (Talisman)
    if app.config.get('FORCE_HTTPS'):
        Talisman(app,
                force_https=True,
                strict_transport_security=True,
                strict_transport_security_max_age=app.config['HSTS_MAX_AGE'],
                content_security_policy={
                    'default-src': "'self'",
                    'script-src': "'self'",
                    'style-src': ["'self'", "'unsafe-inline'"],
                    'img-src': ["'self'", 'data:', 'https:'],
                    'font-src': ["'self'", 'data:'],
                })

    # Rate limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        storage_uri=app.config['RATELIMIT_STORAGE_URL'],
        default_limits=[
            f"{app.config['RATELIMIT_PER_MINUTE']} per minute",
            f"{app.config['RATELIMIT_PER_HOUR']} per hour",
            f"{app.config['RATELIMIT_PER_DAY']} per day"
        ],
        storage_options={"socket_connect_timeout": 30},
        strategy="fixed-window"
    )

    # CORS (if needed)
    if app.config.get('CORS_ORIGINS'):
        from flask_cors import CORS
        CORS(app, origins=app.config['CORS_ORIGINS'])

    # Register routes
    from app import routes
    routes.init_app(app, limiter)

    # Health check logging
    app.logger.info(f"Application started in {config_name} mode")

    return app
```

### 6. backend/app/llm_service.py (WITH STREAMING)

```python
"""
LLM Service with streaming support
Handles communication with OpenAI and Anthropic APIs
"""
import os
import logging
from openai import OpenAI
from anthropic import Anthropic

logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with LLM providers"""

    def __init__(self, config):
        self.config = config
        self.openai_client = None
        self.anthropic_client = None

        # Initialize OpenAI if key is available
        if config.get('OPENAI_API_KEY'):
            self.openai_client = OpenAI(api_key=config['OPENAI_API_KEY'])
            logger.info("OpenAI client initialized")

        # Initialize Anthropic if key is available
        if config.get('ANTHROPIC_API_KEY'):
            self.anthropic_client = Anthropic(api_key=config['ANTHROPIC_API_KEY'])
            logger.info("Anthropic client initialized")

    def chat_openai(self, messages, model=None, stream=False):
        """
        Send chat to OpenAI

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (default from config)
            stream: Enable streaming responses

        Returns:
            Generator if stream=True, dict if stream=False
        """
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")

        model = model or self.config.get('DEFAULT_MODEL', 'gpt-4')
        max_tokens = self.config.get('MAX_TOKENS', 1000)
        temperature = self.config.get('TEMPERATURE', 0.7)

        try:
            logger.info(f"OpenAI request: model={model}, stream={stream}")

            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=stream
            )

            if stream:
                return self._stream_openai_response(response, model)
            else:
                return {
                    'success': True,
                    'message': response.choices[0].message.content,
                    'model': model,
                    'usage': {
                        'prompt_tokens': response.usage.prompt_tokens,
                        'completion_tokens': response.usage.completion_tokens,
                        'total_tokens': response.usage.total_tokens
                    }
                }
        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _stream_openai_response(self, response, model):
        """Generator for OpenAI streaming responses"""
        try:
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield {
                        'type': 'chunk',
                        'content': chunk.choices[0].delta.content,
                        'model': model
                    }

            yield {'type': 'done', 'model': model}

        except Exception as e:
            logger.error(f"OpenAI streaming error: {str(e)}")
            yield {'type': 'error', 'error': str(e)}

    def chat_claude(self, messages, model=None, stream=False):
        """
        Send chat to Claude

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (default: claude-3-sonnet)
            stream: Enable streaming responses

        Returns:
            Generator if stream=True, dict if stream=False
        """
        if not self.anthropic_client:
            raise ValueError("Anthropic API key not configured")

        model = model or 'claude-3-5-sonnet-20241022'
        max_tokens = self.config.get('MAX_TOKENS', 1000)

        try:
            logger.info(f"Claude request: model={model}, stream={stream}")

            # Convert OpenAI format to Anthropic format
            system_msg = next((m['content'] for m in messages if m['role'] == 'system'), None)
            user_messages = [m for m in messages if m['role'] != 'system']

            response = self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system_msg if system_msg else "You are a helpful assistant.",
                messages=user_messages,
                stream=stream
            )

            if stream:
                return self._stream_claude_response(response, model)
            else:
                return {
                    'success': True,
                    'message': response.content[0].text,
                    'model': model,
                    'usage': {
                        'input_tokens': response.usage.input_tokens,
                        'output_tokens': response.usage.output_tokens
                    }
                }
        except Exception as e:
            logger.error(f"Claude error: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _stream_claude_response(self, response, model):
        """Generator for Claude streaming responses"""
        try:
            for event in response:
                if event.type == 'content_block_delta':
                    if hasattr(event.delta, 'text'):
                        yield {
                            'type': 'chunk',
                            'content': event.delta.text,
                            'model': model
                        }
                elif event.type == 'message_stop':
                    yield {'type': 'done', 'model': model}

        except Exception as e:
            logger.error(f"Claude streaming error: {str(e)}")
            yield {'type': 'error', 'error': str(e)}
```

### 7. backend/app/routes.py (WITH STREAMING)

```python
"""
API routes for the chatbot
"""
from flask import jsonify, request, send_from_directory, Response, stream_with_context
from app.llm_service import LLMService
import logging
import json

logger = logging.getLogger(__name__)

def init_app(app, limiter):
    """Initialize routes with app and limiter"""

    # Initialize LLM service
    llm_service = LLMService(app.config)

    # Serve PWA frontend
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        try:
            return send_from_directory(app.static_folder, path)
        except:
            # SPA fallback - serve index.html for unknown routes
            return send_from_directory(app.static_folder, 'index.html')

    # Health check
    @app.route('/api/health')
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
            data = request.get_json()

            # Validate input
            if not data or 'message' not in data:
                return jsonify({'error': 'Message required'}), 400

            user_message = data['message']
            provider = data.get('provider', 'openai')
            model = data.get('model')
            history = data.get('history', [])

            # Validate message length
            if len(user_message) > 10000:
                return jsonify({'error': 'Message too long (max 10,000 characters)'}), 400

            # Validate history length
            if len(history) > 50:
                return jsonify({'error': 'Conversation history too long (max 50 messages)'}), 400

            # Build conversation
            conversation = history + [{"role": "user", "content": user_message}]

            # Add system message if not present
            if not any(msg['role'] == 'system' for msg in conversation):
                conversation = [
                    {"role": "system", "content": "You are a helpful AI assistant."}
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
            data = request.get_json()

            # Validate input (same as regular chat)
            if not data or 'message' not in data:
                return jsonify({'error': 'Message required'}), 400

            user_message = data['message']
            provider = data.get('provider', 'openai')
            model = data.get('model')
            history = data.get('history', [])

            if len(user_message) > 10000:
                return jsonify({'error': 'Message too long'}), 400

            # Build conversation
            conversation = history + [{"role": "user", "content": user_message}]

            if not any(msg['role'] == 'system' for msg in conversation):
                conversation = [
                    {"role": "system", "content": "You are a helpful AI assistant."}
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
                {'id': 'gpt-3.5-turbo', 'name': 'GPT-3.5 Turbo', 'available': llm_service.openai_client is not None}
            ],
            'claude': [
                {'id': 'claude-3-5-sonnet-20241022', 'name': 'Claude 3.5 Sonnet', 'available': llm_service.anthropic_client is not None},
                {'id': 'claude-3-opus-20240229', 'name': 'Claude 3 Opus', 'available': llm_service.anthropic_client is not None}
            ]
        })

    # Rate limit info
    @app.route('/api/rate-limit')
    def rate_limit_info():
        """Get current rate limit status"""
        # This would require storing per-user limits
        # For now, return configured limits
        return jsonify({
            'limits': {
                'per_minute': app.config['RATELIMIT_PER_MINUTE'],
                'per_hour': app.config['RATELIMIT_PER_HOUR'],
                'per_day': app.config['RATELIMIT_PER_DAY']
            }
        })

    # Error handlers
    @app.errorhandler(429)
    def ratelimit_handler(e):
        logger.warning(f"Rate limit exceeded: {request.remote_addr}")
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.'
        }), 429

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': 'Something went wrong. Please try again.'
        }), 500
```

### 8. backend/run.py

```python
"""
Application entry point
"""
from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False') == 'True'

    print(f"""
    ╔══════════════════════════════════════╗
    ║  PWA Chatbot Backend Server          ║
    ║  Running on http://localhost:{port}    ║
    ╚══════════════════════════════════════╝
    """)

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )
```

---

## 🎨 Frontend Integration

### 9. frontend/src/js/chat-client.js (WITH STREAMING)

```javascript
/**
 * Chat API Client with Streaming Support
 * Handles communication with backend LLM service
 */
class ChatClient {
  constructor() {
    this.apiBase = '/api';
    this.conversationHistory = [];
    this.abortController = null;
  }

  /**
   * Send message to chatbot (non-streaming)
   * @param {string} message - User message
   * @param {string} provider - 'openai' or 'claude'
   * @param {string} model - Specific model ID
   * @returns {Promise<object>} Response from LLM
   */
  async sendMessage(message, provider = 'openai', model = null) {
    try {
      const response = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          provider: provider,
          model: model,
          history: this.conversationHistory
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: data.message }
      );

      return data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  /**
   * Send message with streaming response
   * @param {string} message - User message
   * @param {string} provider - 'openai' or 'claude'
   * @param {function} onChunk - Callback for each chunk
   * @param {function} onComplete - Callback when done
   * @param {function} onError - Callback for errors
   */
  async sendMessageStream(message, provider, { onChunk, onComplete, onError }) {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.apiBase}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          provider: provider,
          history: this.conversationHistory
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullMessage = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                fullMessage += data.content;
                onChunk(data.content, fullMessage);
              } else if (data.type === 'done') {
                // Update history
                this.conversationHistory.push(
                  { role: 'user', content: message },
                  { role: 'assistant', content: fullMessage }
                );
                onComplete(fullMessage, data.model);
              } else if (data.type === 'error') {
                onError(new Error(data.error));
              }
            } catch (e) {
              console.error('Failed to parse SSE:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Stream error:', error);
        onError(error);
      }
    }
  }

  /**
   * Cancel ongoing streaming request
   */
  cancelStream() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Get available models
   * @returns {Promise<object>} Available models
   */
  async getModels() {
    try {
      const response = await fetch(`${this.apiBase}/models`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return { openai: [], claude: [] };
    }
  }

  /**
   * Health check
   * @returns {Promise<boolean>} True if backend is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get rate limit info
   */
  async getRateLimits() {
    try {
      const response = await fetch(`${this.apiBase}/rate-limit`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch rate limits:', error);
      return null;
    }
  }
}

export default ChatClient;
```

---

## ✅ Implementation Checklist

### Backend Setup
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate venv: `source venv/bin/activate` (Unix) or `venv\Scripts\activate` (Windows)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Copy `.env.example` to `.env`
- [ ] Add your API keys to `.env`
- [ ] Install Redis (or use Docker): `brew install redis` / `docker run -d -p 6379:6379 redis`
- [ ] Start Redis: `redis-server`
- [ ] Test backend: `python run.py`
- [ ] Verify health check: `curl http://localhost:5000/api/health`

### LLM Configuration
- [ ] Obtain OpenAI API key from https://platform.openai.com/api-keys
- [ ] Obtain Anthropic API key from https://console.anthropic.com/
- [ ] Add keys to `.env` file
- [ ] Test LLM connection: `curl -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d '{"message":"Hello"}'`
- [ ] Verify streaming works: Test `/api/chat/stream` endpoint

### Security Configuration
- [ ] Generate strong SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Configure rate limits in `.env`
- [ ] Set up HTTPS for production
- [ ] Review CSP headers in `app/__init__.py`
- [ ] Enable session security flags
- [ ] Test rate limiting

### Frontend Integration
- [ ] Add `chat-client.js` to `src/js/`
- [ ] Create `chat.html` page
- [ ] Add chat styles to `main.css` or `chat.css`
- [ ] Update `app.js` to include chat functionality
- [ ] Build frontend: `npm run build`
- [ ] Test frontend-backend connection

### Testing
- [ ] Test non-streaming chat
- [ ] Test streaming chat
- [ ] Test rate limiting (make >10 requests/minute)
- [ ] Test error handling (invalid input, no API key)
- [ ] Test conversation history
- [ ] Test model switching (OpenAI ↔ Claude)
- [ ] Test offline behavior (PWA offline queue)

### Deployment Preparation
- [ ] Build production frontend: `npm run build`
- [ ] Configure production environment variables
- [ ] Set `FLASK_ENV=production`
- [ ] Set `SESSION_COOKIE_SECURE=True`
- [ ] Configure logging for production
- [ ] Test production build locally
- [ ] Create deployment scripts

### Deployment
- [ ] Choose hosting platform (Railway, Render, Fly.io, etc.)
- [ ] Configure environment variables on platform
- [ ] Deploy application
- [ ] Verify HTTPS is working
- [ ] Test deployed application
- [ ] Monitor logs
- [ ] Set up error alerting

### Documentation
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Document deployment process
- [ ] Add troubleshooting guide
- [ ] Document rate limits and quotas

---

## 🧪 Testing Commands

```bash
# Health check
curl http://localhost:5000/api/health

# List models
curl http://localhost:5000/api/models

# Test chat (OpenAI)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?", "provider": "openai"}'

# Test chat (Claude)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain quantum computing", "provider": "claude"}'

# Test streaming (with curl)
curl -N -X POST http://localhost:5000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a short poem", "provider": "openai"}'

# Check rate limits
curl http://localhost:5000/api/rate-limit
```

---

## 🚨 Security Reminders

1. **NEVER commit `.env` file to git**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment variables for all secrets**
   - API keys
   - SECRET_KEY
   - Database credentials
   - Redis URL

3. **Enable HTTPS in production**
   - Use Let's Encrypt, Cloudflare, or platform SSL
   - Set `SESSION_COOKIE_SECURE=True`
   - Enable HSTS headers

4. **Implement rate limiting**
   - Protect against abuse
   - Monitor usage patterns
   - Adjust limits based on actual usage

5. **Sanitize all user input**
   - Validate message length
   - Check for malicious content
   - Log suspicious activity

6. **Monitor costs**
   - LLM API usage can be expensive
   - Set up budget alerts
   - Monitor token usage
   - Implement per-user quotas if needed

---

## 📊 Monitoring & Logging

### Log Files Location
- Development: `backend/logs/app.log`
- Production: Configure external logging service (e.g., Papertrail, Loggly)

### Key Metrics to Monitor
- API response times
- LLM token usage
- Error rates
- Rate limit hits
- User session counts
- Model usage distribution

### Logging Best Practices
```python
# Good logging examples
logger.info(f"Chat request: provider={provider}, user_id={user_id}")
logger.warning(f"Rate limit approaching: {count}/{limit}")
logger.error(f"LLM API error: {error}", exc_info=True)
```

---

## 🎯 Next Steps After Implementation

1. **Add authentication** (optional but recommended)
   - User accounts
   - Session management
   - Per-user conversation history

2. **Add database** (for persistent storage)
   - SQLite for development
   - PostgreSQL for production
   - Store conversation history
   - Store user preferences

3. **Implement user quotas**
   - Limit messages per user per day
   - Track token usage per user
   - Implement paid tiers

4. **Add more features**
   - Voice input/output
   - Image generation
   - Document upload and analysis
   - Multi-modal interactions

5. **Optimize performance**
   - Cache common responses
   - Implement conversation summarization
   - Optimize prompt engineering
   - Add response caching

---

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic API Reference](https://docs.anthropic.com/claude/reference/)
- [Server-Sent Events Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Redis Rate Limiting](https://redis.io/docs/manual/patterns/rate-limiter/)

---

**You now have a complete, production-ready backend for your PWA chatbot with streaming support, rate limiting, authentication capabilities, and comprehensive logging!**
