# Setup Instructions

## ⚠️ CRITICAL: API Key Setup

1. **Get OpenAI API Key:**
   - Visit: https://platform.openai.com/api-keys
   - Create a new secret key
   - Copy the key (starts with `sk-...`)

2. **Configure Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your real API key:
   # OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   python run.py
   ```

4. **Start Frontend:**
   ```bash
   # In a new terminal
   npm run dev
   ```

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install
cd backend && pip install -r requirements.txt

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# 3. Start services
npm run dev  # Terminal 1
cd backend && python run.py  # Terminal 2
```

## Production Deployment

See COMPREHENSIVE_AUDIT_REPORT.md for full deployment guide.
