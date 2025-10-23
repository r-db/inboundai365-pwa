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

    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None  # Token doesn't expire (session-based)

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
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',') if os.environ.get('CORS_ORIGINS') else []

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
    FORCE_HTTPS = os.environ.get('FORCE_HTTPS', 'True') == 'True'

    # Validate required environment variables
    @classmethod
    def validate(cls):
        required = ['SECRET_KEY']
        missing = [key for key in required if not os.environ.get(key)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

        # Check at least one LLM API key is configured
        if not (os.environ.get('OPENAI_API_KEY') or os.environ.get('ANTHROPIC_API_KEY')):
            raise ValueError("At least one LLM API key (OPENAI_API_KEY or ANTHROPIC_API_KEY) must be configured")

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
