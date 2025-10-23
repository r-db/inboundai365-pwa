# PWA Chatbot Backend

Flask-based backend with LLM integration (OpenAI & Anthropic) for the PWA chatbot.

## Features

- ✅ **Streaming Responses** - Server-Sent Events (SSE) for real-time chat
- ✅ **Rate Limiting** - Redis-based rate limiting to prevent abuse
- ✅ **Multiple LLM Providers** - OpenAI (GPT-4) and Anthropic (Claude)
- ✅ **Structured Logging** - JSON logging for production monitoring
- ✅ **Security** - HTTPS enforcement, CSP headers, input validation
- ✅ **Health Checks** - Monitoring endpoints for service status

## Quick Start

### 1. Install Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

**Required environment variables:**
```bash
SECRET_KEY=your-secret-key-here  # Generate with: python -c "import secrets; print(secrets.token_hex(32))"
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com/api-keys
ANTHROPIC_API_KEY=sk-ant-...  # Get from https://console.anthropic.com/
```

### 3. Start Redis (for rate limiting)

```bash
# Option 1: Install locally
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Linux

redis-server

# Option 2: Use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 4. Run Development Server

```bash
python run.py
```

Server will start at `http://localhost:5000`

## API Endpoints

### Health Check
```bash
GET /api/health
```
Returns backend status and available services.

### List Models
```bash
GET /api/models
```
Returns available LLM models.

### Chat (Non-streaming)
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, AI!",
  "provider": "openai",  // or "claude"
  "history": []  // optional conversation history
}
```

### Chat (Streaming)
```bash
POST /api/chat/stream
Content-Type: application/json

{
  "message": "Tell me a story",
  "provider": "openai"
}
```
Returns Server-Sent Events (SSE) stream.

### Rate Limits
```bash
GET /api/rate-limit
```
Returns current rate limit configuration.

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test chat
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?", "provider": "openai"}'

# Test streaming (with curl)
curl -N -X POST http://localhost:5000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a haiku", "provider": "claude"}'
```

## Rate Limiting

Default limits (configurable in `.env`):
- 10 requests per minute
- 100 requests per hour
- 500 requests per day

Adjust in `.env`:
```bash
RATELIMIT_PER_MINUTE=10
RATELIMIT_PER_HOUR=100
RATELIMIT_PER_DAY=500
```

## Production Deployment

### Option 1: Docker

```bash
# From project root
docker-compose up
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: Manual

```bash
# Build frontend
cd frontend
npm install
npm run build

# Set production environment
export FLASK_ENV=production
export SECRET_KEY=your-production-secret-key

# Run with Gunicorn
cd backend
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 'app:create_app()'
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FLASK_ENV` | No | `development` | Environment (development/production) |
| `SECRET_KEY` | **Yes** | - | Flask secret key for sessions |
| `OPENAI_API_KEY` | **Yes*** | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | **Yes*** | - | Anthropic API key |
| `REDIS_URL` | No | `memory://` | Redis connection URL |
| `RATELIMIT_PER_MINUTE` | No | `10` | Requests per minute limit |
| `RATELIMIT_PER_HOUR` | No | `100` | Requests per hour limit |
| `RATELIMIT_PER_DAY` | No | `500` | Requests per day limit |
| `LOG_LEVEL` | No | `INFO` | Logging level |
| `MAX_TOKENS` | No | `1000` | Max tokens per response |
| `TEMPERATURE` | No | `0.7` | LLM temperature |

*At least one LLM API key required

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── routes.py            # API endpoints
│   ├── llm_service.py       # LLM integration
│   ├── logging_config.py    # Logging setup
│   └── middleware.py        # Security middleware
├── logs/                    # Application logs
├── tests/                   # Unit tests
├── config.py                # Configuration classes
├── requirements.txt         # Python dependencies
└── run.py                   # Entry point
```

## Troubleshooting

### Redis Connection Error
```
Error: Redis connection failed
```
**Solution:** Make sure Redis is running:
```bash
redis-server
# or
docker run -d -p 6379:6379 redis
```

### API Key Not Set
```
Error: OpenAI API key not configured
```
**Solution:** Add your API key to `.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

### Rate Limit Exceeded
```
Error: 429 Too Many Requests
```
**Solution:** Wait or increase rate limits in `.env`

### Port Already in Use
```
Error: Address already in use
```
**Solution:** Kill existing process or change port:
```bash
# Find process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port
export PORT=5001
python run.py
```

## Development

### Run Tests
```bash
pip install -r requirements-dev.txt
pytest
```

### Code Formatting
```bash
black app/
flake8 app/
```

### View Logs
```bash
tail -f logs/app.log
```

## Security Best Practices

1. ✅ **Never commit `.env` file** - Already in `.gitignore`
2. ✅ **Use strong SECRET_KEY** - Generate with secrets module
3. ✅ **Enable HTTPS in production** - Set `SESSION_COOKIE_SECURE=True`
4. ✅ **Keep API keys secret** - Use environment variables only
5. ✅ **Monitor rate limits** - Check logs for abuse patterns
6. ✅ **Update dependencies** - Run `pip list --outdated` regularly

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic API Reference](https://docs.anthropic.com/claude/reference)
- [Redis Documentation](https://redis.io/documentation)

## License

MIT
