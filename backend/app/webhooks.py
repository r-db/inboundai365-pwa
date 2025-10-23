"""
Webhook Handlers for ElevenLabs and Vonage
Connects voice calls to database operations
"""
from flask import Blueprint, request, jsonify, g
import logging
import json
from datetime import datetime
from .middleware import require_tenant
from .database import db, run_async
from .tools.customer_tools import CustomerTools
from .tools.appointment_tools import AppointmentTools

logger = logging.getLogger(__name__)

webhooks_bp = Blueprint('webhooks', __name__)

# ============================================
# VONAGE WEBHOOKS
# ============================================

@webhooks_bp.route('/webhooks/vonage/answer', methods=['GET', 'POST'])
def vonage_answer():
    """
    Handle incoming call from Vonage
    Returns NCCO to connect to ElevenLabs agent
    """
    # Get call details
    from_number = request.values.get('from')
    to_number = request.values.get('to')
    call_uuid = request.values.get('uuid')
    
    logger.info(f"Incoming call: {from_number} -> {to_number} (UUID: {call_uuid})")
    
    # Look up tenant from phone number
    query = """
        SELECT tenant_id, status
        FROM phone_numbers
        WHERE phone_number = $1
    """
    
    phone_mapping = run_async(db.fetch_one(query, to_number))
    
    if not phone_mapping or phone_mapping['status'] != 'active':
        logger.warning(f"No active tenant found for number: {to_number}")
        return jsonify([{
            'action': 'talk',
            'text': 'This number is not in service. Please check the number and try again.'
        }])
    
    tenant_id = phone_mapping['tenant_id']
    
    # Get agent configuration
    agent_query = """
        SELECT elevenlabs_agent_id, greeting
        FROM agent_configurations
        WHERE tenant_id = $1 AND is_active = true
    """
    
    agent = run_async(db.fetch_one(agent_query, tenant_id))
    
    if not agent:
        logger.error(f"No active agent for tenant: {tenant_id}")
        return jsonify([{
            'action': 'talk',
            'text': 'Our system is temporarily unavailable. Please try again later.'
        }])
    
    # Create call record
    call_insert = """
        INSERT INTO calls (
            tenant_id, 
            vonage_call_uuid, 
            from_number, 
            to_number, 
            status,
            started_at
        ) VALUES ($1, $2, $3, $4, 'connecting', NOW())
        RETURNING call_id
    """
    
    call_id = run_async(
        db.fetch_val(call_insert, tenant_id, call_uuid, from_number, to_number)
    )
    
    logger.info(f"Created call record: {call_id} for tenant: {tenant_id}")
    
    # Return NCCO to connect to ElevenLabs
    import os
    ncco = [{
        'action': 'connect',
        'endpoint': [{
            'type': 'websocket',
            'uri': f"wss://api.elevenlabs.io/v1/convai/conversation?agent_id={agent['elevenlabs_agent_id']}",
            'content-type': 'audio/l16;rate=16000',
            'headers': {
                'Authorization': f"Bearer {os.getenv('ELEVENLABS_API_KEY')}",
                'X-Tenant-ID': tenant_id,
                'X-Call-ID': str(call_id)
            }
        }],
        'eventUrl': [f"https://api.inboundai365.com/webhooks/vonage/events?call_id={call_id}"]
    }]
    
    return jsonify(ncco)

@webhooks_bp.route('/webhooks/vonage/events', methods=['POST'])
def vonage_events():
    """Handle call status events from Vonage"""
    data = request.json
    call_uuid = data.get('uuid')
    status = data.get('status')
    call_id = request.args.get('call_id')
    
    logger.info(f"Vonage event: {status} for call {call_uuid}")
    
    # Update call status
    if call_id:
        update_query = """
            UPDATE calls
            SET status = $1,
                updated_at = NOW()
            WHERE call_id = $2
        """
        run_async(db.execute(update_query, status, call_id))
    
    return jsonify({'status': 'ok'})

# ============================================
# ELEVENLABS WEBHOOKS
# ============================================

@webhooks_bp.route('/webhooks/elevenlabs/tool-call', methods=['POST'])
def elevenlabs_tool_call():
    """
    Handle tool execution requests from ElevenLabs agent
    """
    data = request.json
    
    # Extract metadata
    conversation_id = data.get('conversation_id')
    tool_name = data.get('tool')
    parameters = data.get('parameters', {})
    
    # Get call and tenant from conversation
    call_query = """
        SELECT call_id, tenant_id, from_number
        FROM calls
        WHERE elevenlabs_conversation_id = $1
    """
    
    call_info = run_async(db.fetch_one(call_query, conversation_id))
    
    if not call_info:
        # Try to get tenant from headers (fallback)
        tenant_id = request.headers.get('X-Tenant-ID')
        call_id = request.headers.get('X-Call-ID')
        from_number = None
        
        if not tenant_id:
            logger.error(f"No tenant found for conversation: {conversation_id}")
            return jsonify({'error': 'Tenant context not found'}), 404
    else:
        tenant_id = call_info['tenant_id']
        call_id = call_info['call_id']
        from_number = call_info['from_number']
    
    logger.info(f"Tool call: {tool_name} for tenant {tenant_id}")
    
    # Route to appropriate tool handler
    try:
        result = None
        
        if tool_name == 'check_availability':
            from .tools.appointment_tools import AppointmentTools
            result = AppointmentTools.check_availability(
                tenant_id,
                parameters.get('date'),
                parameters.get('service_id')
            )
        
        elif tool_name == 'book_appointment':
            from .tools.appointment_tools import AppointmentTools
            
            # First get or create customer
            customer_phone = parameters.get('customer_phone', from_number)
            customer_name = parameters.get('customer_name', '')
            
            # Parse name
            name_parts = customer_name.split(' ', 1) if customer_name else ['', '']
            first_name = name_parts[0] if name_parts else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            # Create/update customer
            customer_result = CustomerTools.create_or_update_customer(
                tenant_id,
                customer_phone,
                first_name,
                last_name,
                parameters.get('email')
            )
            
            # Book appointment
            result = AppointmentTools.book_appointment(
                tenant_id,
                customer_result['customer_id'],
                parameters.get('service_id'),
                parameters.get('date'),
                parameters.get('time'),
                parameters.get('notes')
            )
        
        elif tool_name == 'get_customer_info':
            phone = parameters.get('phone', from_number)
            result = CustomerTools.get_customer_info(tenant_id, phone)
        
        elif tool_name == 'get_business_info':
            from .tools.business_tools import BusinessTools
            result = BusinessTools.get_business_context(tenant_id)
        
        elif tool_name == 'cancel_appointment':
            from .tools.appointment_tools import AppointmentTools
            result = AppointmentTools.cancel_appointment(
                tenant_id,
                parameters.get('appointment_id')
            )
        
        else:
            logger.warning(f"Unknown tool: {tool_name}")
            result = {'error': f'Unknown tool: {tool_name}'}
        
        # Log tool execution
        if call_id:
            log_query = """
                INSERT INTO tool_executions (
                    call_id,
                    tenant_id,
                    tool_name,
                    parameters,
                    response,
                    status
                ) VALUES ($1, $2, $3, $4, $5, $6)
            """
            
            run_async(
                db.execute(
                    log_query,
                    call_id,
                    tenant_id,
                    tool_name,
                    json.dumps(parameters),
                    json.dumps(result),
                    'success' if not result.get('error') else 'failed'
                )
            )
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Tool execution error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Tool execution failed', 'details': str(e)}), 500

@webhooks_bp.route('/webhooks/elevenlabs/conversation-started', methods=['POST'])
def conversation_started():
    """Handle conversation start event"""
    data = request.json
    conversation_id = data.get('conversation_id')
    call_id = request.headers.get('X-Call-ID')
    
    if call_id:
        # Update call with conversation ID
        update_query = """
            UPDATE calls
            SET elevenlabs_conversation_id = $1,
                status = 'connected'
            WHERE call_id = $2
        """
        run_async(db.execute(update_query, conversation_id, call_id))
        
        logger.info(f"Conversation started: {conversation_id} for call {call_id}")
    
    return jsonify({'status': 'ok'})

@webhooks_bp.route('/webhooks/elevenlabs/conversation-turn', methods=['POST'])
def conversation_turn():
    """Store conversation transcript"""
    data = request.json
    
    conversation_id = data.get('conversation_id')
    speaker = data.get('speaker', 'unknown')
    message = data.get('message', '')
    turn_number = data.get('turn_number', 0)
    
    # Get call info
    call_query = """
        SELECT call_id, tenant_id
        FROM calls
        WHERE elevenlabs_conversation_id = $1
    """
    
    call_info = run_async(db.fetch_one(call_query, conversation_id))
    
    if call_info:
        # Store transcript turn
        insert_query = """
            INSERT INTO conversation_turns (
                call_id,
                tenant_id,
                speaker,
                message,
                turn_number,
                timestamp
            ) VALUES ($1, $2, $3, $4, $5, NOW())
        """
        
        run_async(
            db.execute(
                insert_query,
                call_info['call_id'],
                call_info['tenant_id'],
                speaker,
                message,
                turn_number
            )
        )
    
    return jsonify({'status': 'ok'})

@webhooks_bp.route('/webhooks/elevenlabs/conversation-ended', methods=['POST'])
def conversation_ended():
    """Handle conversation end event"""
    data = request.json
    
    conversation_id = data.get('conversation_id')
    duration = data.get('duration_seconds', 0)
    recording_url = data.get('recording_url')
    transcript_url = data.get('transcript_url')
    summary = data.get('summary')
    
    # Update call record
    update_query = """
        UPDATE calls
        SET ended_at = NOW(),
            duration_seconds = $1,
            status = 'completed',
            recording_url = $2,
            transcript_url = $3,
            summary = $4
        WHERE elevenlabs_conversation_id = $5
        RETURNING call_id, tenant_id
    """
    
    call_info = run_async(
        db.fetch_one(
            update_query,
            duration,
            recording_url,
            transcript_url,
            summary,
            conversation_id
        )
    )
    
    if call_info:
        # Update usage tracking
        minutes = (duration + 59) // 60  # Round up to nearest minute
        usage_query = """
            UPDATE usage_tracking
            SET total_minutes = total_minutes + $1
            WHERE tenant_id = $2
                AND billing_month = DATE_TRUNC('month', CURRENT_DATE)
        """
        
        run_async(db.execute(usage_query, minutes, call_info['tenant_id']))
        
        # Calculate costs
        elevenlabs_cost = minutes * 0.02  # Business plan rate
        vonage_cost = minutes * 0.012
        
        cost_query = """
            UPDATE calls
            SET elevenlabs_cost = $1,
                vonage_cost = $2,
                total_cost = $3
            WHERE call_id = $4
        """
        
        run_async(
            db.execute(
                cost_query,
                elevenlabs_cost,
                vonage_cost,
                elevenlabs_cost + vonage_cost,
                call_info['call_id']
            )
        )
        
        logger.info(f"Call completed: {call_info['call_id']}, Duration: {duration}s, Cost: ${elevenlabs_cost + vonage_cost:.2f}")
    
    return jsonify({'status': 'ok'})

# Register blueprint
def init_webhooks(app):
    """Initialize webhook routes"""
    app.register_blueprint(webhooks_bp)