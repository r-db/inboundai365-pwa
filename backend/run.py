"""
Application entry point
Run the Flask development server
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
    ║  Environment: {os.environ.get('FLASK_ENV', 'development')}
    ╚══════════════════════════════════════╝

    Available endpoints:
    - GET  /                    Frontend (if built)
    - GET  /api/health          Health check
    - GET  /api/models          List available models
    - POST /api/chat            Chat (non-streaming)
    - POST /api/chat/stream     Chat (streaming SSE)
    - GET  /api/rate-limit      Rate limit info

    Press CTRL+C to quit
    """)

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )
