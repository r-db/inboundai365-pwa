// PWA Debugger and Development Tools
export class PWADebugger {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
    this.logs = [];
    this.init();
  }

  init() {
    if (!this.enabled) return;

    this.setupDevTools();
    this.monitorPerformance();
    this.checkPWAFeatures();
    this.addDebugPanel();
  }

  setupDevTools() {
    // Add global debug object
    window.__PWA_DEBUG__ = {
      getState: () => window.app?.getState(),
      getMetrics: () => window.app?.getModule('rum')?.getMetrics(),
      getErrors: () => window.app?.getModule('errorBoundary')?.getErrors(),
      getConsent: () => window.app?.getModule('consent')?.getConsent(),
      clearStorage: () => window.app?.getModule('storage')?.clear('all'),
      forceUpdate: () => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      },
      testOffline: () => {
        console.log('Testing offline mode... (Please manually disable network in DevTools)');
      },
      testBackend: async () => {
        return await this.testBackendConnectivity();
      },
      testChat: async (message = 'Hello, test!') => {
        return await this.testChatFlow(message);
      },
      checkChatClient: () => {
        return {
          available: typeof window.ChatClient !== 'undefined',
          instance: window.ChatClient
        };
      },
      logs: this.logs
    };

    console.log('%c🚀 PWA Debugger Enabled', 'color: #0066cc; font-size: 16px; font-weight: bold');
    console.log('Access debug tools via window.__PWA_DEBUG__');
    console.log('Run window.__PWA_DEBUG__.testBackend() to test backend connectivity');
    console.log('Run window.__PWA_DEBUG__.testChat("your message") to test full chat flow');
  }

  async testBackendConnectivity() {
    console.log('%c🔍 Testing Backend Connectivity...', 'color: #0066cc; font-weight: bold');

    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Health endpoint
    try {
      const apiBase = window.location.hostname === 'localhost' && window.location.port === '3000'
        ? 'http://localhost:5001/api'
        : '/api';

      console.log(`  Testing: ${apiBase}/health`);
      const healthResponse = await fetch(`${apiBase}/health`);
      const healthData = await healthResponse.json();

      results.tests.push({
        name: 'Health Check',
        status: healthResponse.ok ? 'PASS' : 'FAIL',
        endpoint: `${apiBase}/health`,
        statusCode: healthResponse.status,
        data: healthData
      });

      console.log(`  ✅ Health Check: ${healthData.status}`);
      console.log(`     OpenAI: ${healthData.services.openai ? '✅' : '❌'}`);
      console.log(`     Claude: ${healthData.services.claude ? '✅' : '❌'}`);
    } catch (error) {
      results.tests.push({
        name: 'Health Check',
        status: 'FAIL',
        error: error.message
      });
      console.error('  ❌ Health Check failed:', error.message);
    }

    // Test 2: Models endpoint
    try {
      const apiBase = window.location.hostname === 'localhost' && window.location.port === '3000'
        ? 'http://localhost:5001/api'
        : '/api';

      console.log(`  Testing: ${apiBase}/models`);
      const modelsResponse = await fetch(`${apiBase}/models`);
      const modelsData = await modelsResponse.json();

      results.tests.push({
        name: 'Models Endpoint',
        status: modelsResponse.ok ? 'PASS' : 'FAIL',
        endpoint: `${apiBase}/models`,
        statusCode: modelsResponse.status,
        data: modelsData
      });

      console.log(`  ✅ Models available: OpenAI=${modelsData.openai?.length || 0}, Claude=${modelsData.claude?.length || 0}`);
    } catch (error) {
      results.tests.push({
        name: 'Models Endpoint',
        status: 'FAIL',
        error: error.message
      });
      console.error('  ❌ Models endpoint failed:', error.message);
    }

    // Test 3: CORS headers
    try {
      const apiBase = window.location.hostname === 'localhost' && window.location.port === '3000'
        ? 'http://localhost:5001/api'
        : '/api';

      console.log(`  Testing: CORS headers`);
      const corsResponse = await fetch(`${apiBase}/health`, { method: 'OPTIONS' });
      const corsHeaders = {
        'access-control-allow-origin': corsResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': corsResponse.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': corsResponse.headers.get('access-control-allow-headers')
      };

      results.tests.push({
        name: 'CORS Configuration',
        status: corsHeaders['access-control-allow-origin'] ? 'PASS' : 'FAIL',
        headers: corsHeaders
      });

      console.log(`  ✅ CORS configured: ${corsHeaders['access-control-allow-origin'] || 'None'}`);
    } catch (error) {
      results.tests.push({
        name: 'CORS Configuration',
        status: 'FAIL',
        error: error.message
      });
      console.error('  ❌ CORS test failed:', error.message);
    }

    // Test 4: ChatClient availability
    const chatClientAvailable = typeof window.ChatClient !== 'undefined';
    results.tests.push({
      name: 'ChatClient Available',
      status: chatClientAvailable ? 'PASS' : 'FAIL',
      available: chatClientAvailable
    });

    console.log(`  ${chatClientAvailable ? '✅' : '❌'} ChatClient: ${chatClientAvailable ? 'Available' : 'Not found in window'}`);

    // Summary
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const total = results.tests.length;

    console.log(`\n%c📊 Summary: ${passed}/${total} tests passed`,
      passed === total ? 'color: #10b981; font-weight: bold' : 'color: #f59e0b; font-weight: bold');

    return results;
  }

  async testChatFlow(message = 'Hello, test!') {
    console.log('%c🧪 Testing Full Chat Flow...', 'color: #0066cc; font-weight: bold');

    if (typeof window.ChatClient === 'undefined') {
      console.error('❌ ChatClient not available');
      return { status: 'FAIL', error: 'ChatClient not loaded' };
    }

    try {
      const client = new window.ChatClient();
      console.log('  ✅ ChatClient instantiated');

      console.log(`  Sending message: "${message}"`);
      const startTime = Date.now();

      const response = await client.sendMessage(message, 'openai');
      const duration = Date.now() - startTime;

      console.log(`  ✅ Response received in ${duration}ms`);
      console.log(`     Model: ${response.model}`);
      console.log(`     Tokens: ${response.usage?.total_tokens || 'N/A'}`);
      console.log(`     Message: ${response.message.substring(0, 100)}${response.message.length > 100 ? '...' : ''}`);

      return {
        status: 'PASS',
        duration,
        response
      };
    } catch (error) {
      console.error(`  ❌ Chat flow failed: ${error.message}`);
      return {
        status: 'FAIL',
        error: error.message
      };
    }
  }

  monitorPerformance() {
    // Log performance entries
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.log('performance', {
              type: entry.entryType,
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime
            });
          });
        });

        observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      } catch (e) {
        console.warn('Performance monitoring failed:', e);
      }
    }
  }

  checkPWAFeatures() {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      cacheAPI: 'caches' in window,
      notifications: 'Notification' in window,
      pushManager: 'PushManager' in window,
      sync: 'serviceWorker' in navigator && 'SyncManager' in window,
      indexedDB: 'indexedDB' in window,
      localStorage: typeof Storage !== 'undefined',
      webShare: 'share' in navigator,
      viewTransitions: 'startViewTransition' in document,
      speculationRules: HTMLScriptElement.supports?.('speculationrules'),
      badging: 'setAppBadge' in navigator,
      fileSystemAccess: 'showOpenFilePicker' in window,
      webRTC: 'RTCPeerConnection' in window,
      webGL: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
          return false;
        }
      })()
    };

    console.group('PWA Feature Detection');
    Object.entries(features).forEach(([feature, supported]) => {
      console.log(`${supported ? '✅' : '❌'} ${feature}`);
    });
    console.groupEnd();

    return features;
  }

  log(category, data) {
    const entry = {
      category,
      data,
      timestamp: Date.now(),
      time: new Date().toISOString()
    };

    this.logs.push(entry);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    if (this.enabled) {
      console.log(`[${category}]`, data);
    }
  }

  addDebugPanel() {
    if (!this.enabled) return;

    // Create debug button
    const button = document.createElement('button');
    button.textContent = '🛠️';
    button.setAttribute('aria-label', 'Open debug panel');
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #0066cc;
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    button.addEventListener('click', () => this.togglePanel());
    document.body.appendChild(button);
  }

  togglePanel() {
    let panel = document.getElementById('debug-panel');

    if (panel) {
      panel.remove();
      return;
    }

    panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 9999;
      overflow: hidden;
      font-family: monospace;
      font-size: 12px;
    `;

    const metrics = window.app?.getModule('rum')?.getMetrics() || {};
    const state = window.app?.getState() || {};
    const errors = window.app?.getModule('errorBoundary')?.getErrors() || [];

    panel.innerHTML = `
      <div style="padding: 10px; background: #0066cc; color: white; font-weight: bold;">
        PWA Debug Panel
      </div>
      <div style="padding: 10px; max-height: 550px; overflow-y: auto;">
        <h3 style="margin: 10px 0;">Performance Metrics</h3>
        <pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(metrics, null, 2)}</pre>

        <h3 style="margin: 10px 0;">Application State</h3>
        <pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(state, null, 2)}</pre>

        <h3 style="margin: 10px 0;">Errors (${errors.length})</h3>
        <pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(errors.slice(-5), null, 2)}</pre>

        <h3 style="margin: 10px 0;">Actions</h3>
        <button onclick="window.__PWA_DEBUG__.forceUpdate()" style="margin: 5px; padding: 8px; cursor: pointer;">Force Update</button>
        <button onclick="window.__PWA_DEBUG__.clearStorage()" style="margin: 5px; padding: 8px; cursor: pointer;">Clear Storage</button>
        <button onclick="window.location.reload()" style="margin: 5px; padding: 8px; cursor: pointer;">Reload</button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  // Test utilities
  static async testServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker not supported');
      return false;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    console.log('Service Worker registration:', registration);

    if (registration) {
      console.log('Active:', registration.active);
      console.log('Waiting:', registration.waiting);
      console.log('Installing:', registration.installing);
    }

    return !!registration;
  }

  static async testCache() {
    if (!('caches' in window)) {
      console.error('Cache API not supported');
      return false;
    }

    const cacheNames = await caches.keys();
    console.log('Cache names:', cacheNames);

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      console.log(`Cache "${name}":`, requests.length, 'entries');
    }

    return true;
  }

  static async testIndexedDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open('test_db', 1);

      request.onsuccess = () => {
        console.log('IndexedDB is working');
        const db = request.result;
        db.close();
        indexedDB.deleteDatabase('test_db');
        resolve(true);
      };

      request.onerror = () => {
        console.error('IndexedDB test failed');
        resolve(false);
      };
    });
  }

  static runAllTests() {
    console.group('PWA Feature Tests');

    this.testServiceWorker()
      .then(result => console.log('Service Worker:', result ? '✅' : '❌'));

    this.testCache()
      .then(result => console.log('Cache API:', result ? '✅' : '❌'));

    this.testIndexedDB()
      .then(result => console.log('IndexedDB:', result ? '✅' : '❌'));

    console.groupEnd();
  }
}

export default PWADebugger;
