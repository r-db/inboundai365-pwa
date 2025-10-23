# pwa_template WORKER INSTRUCTIONS

## 🎯 YOUR MISSION
Update pwa_template to use the secure PWA_CRM proxy instead of direct LLM API calls.

## 📖 REQUIRED READING
Read: `/Users/riscentrdb/Desktop/projects/build_context/06_SECURE_LLM_API_MANAGEMENT.md`

## ✅ TASKS (Execute in Order)

### TASK 1: Remove Old Backend
The chatbot backend is no longer needed since PWA_CRM handles all LLM calls.

```bash
rm -rf backend/
```

Update `package.json` - remove any backend-related scripts

---

### TASK 2: Create Config Module
Create: `src/js/config.js`

```javascript
// Configuration loaded from environment at build time
export const PWA_CONFIG = {
  TENANT_ID: window.TENANT_ID || process.env.TENANT_ID,
  CRM_API_URL: window.CRM_API_URL || process.env.NEXT_PUBLIC_CRM_API_URL || 'https://api.ib365.com',
  LLM_PROXY_KEY: window.LLM_PROXY_KEY || process.env.NEXT_PUBLIC_LLM_PROXY_KEY
};

// Validate config on load
if (!PWA_CONFIG.LLM_PROXY_KEY) {
  console.warn('⚠️ LLM_PROXY_KEY not configured - chatbot will not work');
}

if (!PWA_CONFIG.TENANT_ID) {
  console.warn('⚠️ TENANT_ID not configured');
}

// Expose globally for debugging
window.PWA_CONFIG = PWA_CONFIG;
```

---

### TASK 3: Update Chat Client
Update: `src/js/chat.js`

Key changes:
1. Remove direct OpenAI calls
2. Use PWA_CRM proxy endpoint
3. Send `X-Proxy-Key` header
4. Handle SSE streaming from proxy

```javascript
import { PWA_CONFIG } from './config.js';

class RobustChat {
  constructor() {
    this.apiUrl = PWA_CONFIG.CRM_API_URL;
    this.proxyKey = PWA_CONFIG.LLM_PROXY_KEY;
    this.sessionId = this.generateSessionId();
    this.conversationHistory = [];
    
    if (!this.proxyKey) {
      console.error('❌ No LLM proxy key configured!');
    }
  }

  generateSessionId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(userMessage) {
    // Add to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      // Check if appointment-related to enrich with CRM data
      const needsCRM = /appointment|booking|schedule|available/i.test(userMessage);
      
      if (needsCRM && this.crmClient) {
        const enriched = await this.enrichMessageWithCRM(userMessage);
        this.conversationHistory[this.conversationHistory.length - 1].content = enriched;
      }

      // Call PWA_CRM proxy endpoint
      const response = await fetch(`${this.apiUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Key': this.proxyKey
        },
        body: JSON.stringify({
          messages: this.conversationHistory,
          session_id: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      // Handle SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.chunk) {
                assistantMessage += data.chunk;
                this.appendToMessage(data.chunk);
              } else if (data.done) {
                console.log('✅ Chat complete. Usage:', data.usage);
                this.displayUsage(data.usage);
              } else if (data.error) {
                console.error('❌ Stream error:', data.error);
                this.displayError(data.error);
              }
            } catch (e) {
              console.warn('Could not parse SSE data:', line);
            }
          }
        }
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

    } catch (error) {
      console.error('Chat error:', error);
      this.displayError('Failed to connect to chatbot service. Please try again.');
    }
  }

  async enrichMessageWithCRM(message) {
    try {
      const services = await this.crmClient.getServices();
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const availabilityToday = await this.crmClient.checkAvailability(today);
      const availabilityTomorrow = await this.crmClient.checkAvailability(tomorrow);

      const context = `
[CRM Context - Use this information to help the customer]
Available Services:
${services.map(s => `- ${s.name} (${s.duration}min, $${s.price})`).join('\n')}

Availability:
${today}: ${availabilityToday.available ? `${availabilityToday.slots.length} slots available` : 'Fully booked'}
${tomorrow}: ${availabilityTomorrow.available ? `${availabilityTomorrow.slots.length} slots available` : 'Fully booked'}
`;

      return `${message}\n\n${context}`;
    } catch (error) {
      console.error('CRM enrichment failed:', error);
      return message;
    }
  }

  displayUsage(usage) {
    // Optional: Display token usage in UI
    if (!usage) return;
    
    const usageEl = document.createElement('div');
    usageEl.className = 'chat-usage-stats';
    usageEl.innerHTML = `
      <small class="text-gray-500 text-xs">
        Tokens: ${usage.total_tokens} | Cost: $${usage.cost.toFixed(5)}
      </small>
    `;
    
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.appendChild(usageEl);
    }
  }

  appendToMessage(chunk) {
    // Update the last message bubble with new chunk
    let lastBubble = document.querySelector('.chat-message.assistant:last-child .message-text');
    
    if (!lastBubble) {
      // Create new message bubble
      const bubble = document.createElement('div');
      bubble.className = 'chat-message assistant';
      bubble.innerHTML = '<div class="message-text"></div>';
      document.querySelector('.chat-messages').appendChild(bubble);
      lastBubble = bubble.querySelector('.message-text');
    }
    
    lastBubble.textContent += chunk;
    
    // Auto-scroll
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  displayError(error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'chat-message error';
    errorEl.innerHTML = `
      <div class="message-text bg-red-50 text-red-800 p-3 rounded">
        ⚠️ ${error}
      </div>
    `;
    document.querySelector('.chat-messages').appendChild(errorEl);
  }
}

// Initialize
const chat = new RobustChat();
window.chat = chat;

export default chat;
```

---

### TASK 4: Update Environment Variables
Update: `.env.example`

```bash
# Tenant Configuration
TENANT_ID=your-tenant-uuid-here

# CRM API
NEXT_PUBLIC_CRM_API_URL=http://localhost:5000

# LLM Proxy Key (from admin-console)
NEXT_PUBLIC_LLM_PROXY_KEY=ib365_proxy_openai_abc123...

# Note: This proxy key is SAFE to expose in client code
# It only works for this specific tenant and is not the actual OpenAI/Anthropic key
```

Create: `.env.local` (for local testing)

```bash
TENANT_ID=11111111-1111-1111-1111-111111111111
NEXT_PUBLIC_CRM_API_URL=http://localhost:5000
NEXT_PUBLIC_LLM_PROXY_KEY=test_proxy_key_here
```

---

### TASK 5: Update Webpack Config
Update: `webpack.config.js`

Add environment variable injection:

```javascript
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load env vars
const env = dotenv.config().parsed || {};

module.exports = {
  // ... existing config
  
  plugins: [
    new webpack.DefinePlugin({
      'process.env.TENANT_ID': JSON.stringify(env.TENANT_ID || ''),
      'process.env.NEXT_PUBLIC_CRM_API_URL': JSON.stringify(env.NEXT_PUBLIC_CRM_API_URL || 'https://api.ib365.com'),
      'process.env.NEXT_PUBLIC_LLM_PROXY_KEY': JSON.stringify(env.NEXT_PUBLIC_LLM_PROXY_KEY || '')
    }),
    // ... other plugins
  ]
};
```

---

### TASK 6: Update HTML Template
Update: `src/index.html`

Add config injection point:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... existing head -->
</head>
<body>
  <!-- Config injection (for production deployments) -->
  <script>
    // These will be replaced during deployment
    window.TENANT_ID = '%TENANT_ID%';
    window.CRM_API_URL = '%CRM_API_URL%';
    window.LLM_PROXY_KEY = '%LLM_PROXY_KEY%';
  </script>
  
  <!-- ... rest of body -->
</body>
</html>
```

---

### TASK 7: Update Security CSP
Update: `src/js/security.js`

Remove old backend references, ensure PWA_CRM is allowed:

```javascript
const CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': [
    "'self'",
    'http://localhost:5000',  // PWA_CRM local
    'https://api.ib365.com',  // PWA_CRM production
  ],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"]
};
```

---

### TASK 8: Update Package.json Scripts
Update: `package.json`

Remove backend scripts:

```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "preview": "webpack serve --mode production"
  }
}
```

---

### TASK 9: Create Deployment Script
Create: `scripts/deploy.sh`

```bash
#!/bin/bash
# Deployment script for pwa_template instances

# Usage: ./scripts/deploy.sh TENANT_ID PROXY_KEY

TENANT_ID=$1
PROXY_KEY=$2

if [ -z "$TENANT_ID" ] || [ -z "$PROXY_KEY" ]; then
  echo "Usage: ./scripts/deploy.sh TENANT_ID PROXY_KEY"
  exit 1
fi

# Set environment variables
export TENANT_ID=$TENANT_ID
export NEXT_PUBLIC_CRM_API_URL="https://api.ib365.com"
export NEXT_PUBLIC_LLM_PROXY_KEY=$PROXY_KEY

# Build
npm run build

# Deploy to Vercel
vercel --prod

echo "✅ Deployed for tenant: $TENANT_ID"
```

---

### TASK 10: Test Integration
Create: `tests/test-proxy-integration.js`

```javascript
// Test that chat works with proxy

async function testProxyIntegration() {
  console.log('Testing PWA_CRM proxy integration...');
  
  const response = await fetch('http://localhost:5000/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Proxy-Key': 'test_proxy_key'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      session_id: 'test_session'
    })
  });

  if (response.ok) {
    console.log('✅ Proxy endpoint reachable');
    
    // Read stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunks = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value);
      if (text.includes('data:')) chunks++;
    }
    
    console.log(`✅ Received ${chunks} chunks from proxy`);
    console.log('✅ Integration test passed!');
  } else {
    console.error('❌ Proxy endpoint failed:', response.status);
  }
}

testProxyIntegration().catch(console.error);
```

---

## 🎯 COMPLETION CHECKLIST

Before marking complete, verify:
- [ ] Old backend directory removed
- [ ] Config module created and working
- [ ] Chat uses proxy endpoint
- [ ] X-Proxy-Key header sent
- [ ] SSE streaming works
- [ ] CRM enrichment still works
- [ ] Environment variables updated
- [ ] Webpack config updated
- [ ] No direct LLM API calls in code
- [ ] Test with local PWA_CRM proxy

---

## 🧪 TESTING STEPS

1. Start PWA_CRM backend: `cd PWA_CRM/backend && python run.py`
2. Configure test proxy key in PWA_CRM
3. Set proxy key in pwa_template `.env.local`
4. Start pwa_template: `npm run dev`
5. Open http://localhost:4000
6. Open browser console
7. Send test message: "I need an appointment"
8. Verify:
   - Message sent to proxy
   - Response streamed back
   - No errors in console
   - Usage stats logged

---

## 🚨 CRITICAL CHECKS

- [ ] No API keys in client code
- [ ] Proxy key from environment only
- [ ] Falls back gracefully if proxy key missing
- [ ] Error messages user-friendly
- [ ] CRM integration still works

---

**When complete, update:** `/Users/riscentrdb/Desktop/projects/build_context/EXECUTION_PLAN.md`

Mark pwa_template tasks as ✅ COMPLETE
