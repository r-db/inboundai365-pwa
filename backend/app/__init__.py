"""
Flask application factory
"""
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect
import sys
import os

# Add parent directory to path for config import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import config

def create_app(config_name=None):
    """Create and configure Flask application"""

    # Determine frontend dist path
    frontend_dist = os.path.abspath(os.path.join(
        os.path.dirname(__file__), '../../frontend/dist'
    ))

    app = Flask(__name__,
                static_folder=frontend_dist if os.path.exists(frontend_dist) else None,
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

    # CSRF Protection
    csrf = CSRFProtect(app)
    app.logger.info("CSRF protection enabled")

    # Security headers (Talisman) - only in production
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
                    'connect-src': "'self'"
                })

    # Rate limiting
    try:
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
        app.logger.info("Rate limiting enabled")
    except Exception as e:
        app.logger.warning(f"Rate limiting initialization failed: {e}. Using memory storage.")
        limiter = Limiter(
            app=app,
            key_func=get_remote_address,
            storage_uri='memory://',
            default_limits=[
                f"{app.config['RATELIMIT_PER_MINUTE']} per minute"
            ]
        )

    # CORS (if needed)
    if app.config.get('CORS_ORIGINS'):
        from flask_cors import CORS
        CORS(app,
             origins=app.config['CORS_ORIGINS'],
             supports_credentials=True,
             allow_headers=['Content-Type', 'Authorization', 'X-CSRFToken'],
             methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
        app.logger.info(f"CORS enabled for: {app.config['CORS_ORIGINS']}")

    # Register routes
    from app import routes
    routes.init_app(app, limiter)

    # Health check logging
    app.logger.info(f"Application started in {config_name} mode")
    app.logger.info(f"Static folder: {app.static_folder}")

    return app
