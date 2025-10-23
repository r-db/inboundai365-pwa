"""
Tenant Context Middleware
Ensures all requests are properly scoped to a tenant
"""
from functools import wraps
from flask import request, g, abort, jsonify
import jwt
import os
import logging

logger = logging.getLogger(__name__)

def get_tenant_from_request():
    """Extract tenant_id from various sources"""
    
    # 1. Check JWT token (primary method)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(
                token, 
                os.getenv('JWT_SECRET'), 
                algorithms=['HS256']
            )
            return payload.get('tenant_id')
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT: {e}")
    
    # 2. Check custom header (for testing)
    if request.headers.get('X-Tenant-ID'):
        return request.headers.get('X-Tenant-ID')
    
    # 3. Check subdomain (for white-label)
    host = request.headers.get('Host', '')
    if '.inboundai365.com' in host:
        subdomain = host.split('.')[0]
        # Look up tenant by subdomain (implement this)
        # return get_tenant_by_subdomain(subdomain)
    
    return None

def require_tenant(f):
    """Decorator to ensure tenant context is set"""
    @wraps(f)
    def decorated(*args, **kwargs):
        tenant_id = get_tenant_from_request()
        
        if not tenant_id:
            logger.warning(f"No tenant context for request: {request.url}")
            return jsonify({
                'error': 'Tenant context required',
                'message': 'Please log in or provide tenant identification'
            }), 401
        
        # Store in Flask's g object for request duration
        g.tenant_id = tenant_id
        logger.debug(f"Request scoped to tenant: {tenant_id}")
        
        return f(*args, **kwargs)
    
    return decorated

def optional_tenant(f):
    """Decorator for endpoints that optionally use tenant context"""
    @wraps(f)
    def decorated(*args, **kwargs):
        tenant_id = get_tenant_from_request()
        g.tenant_id = tenant_id  # Could be None
        return f(*args, **kwargs)
    
    return decorated

# Middleware to inject tenant into all database queries
def inject_tenant_context(app):
    """Add tenant context to all requests"""
    
    @app.before_request
    def before_request():
        # Set tenant in g object
        g.tenant_id = get_tenant_from_request()
        
        # Log the request with tenant context
        if g.tenant_id:
            logger.info(f"Request from tenant {g.tenant_id}: {request.method} {request.path}")
