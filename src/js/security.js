// Security Manager
export class SecurityManager {
  constructor() {
    this.nonce = this.generateNonce();
    this.init();
  }

  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  }

  init() {
    this.initCSP();
    this.initIntegrityChecks();
    this.preventClickjacking();
  }

  initCSP() {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';

    // Allow localhost:5001 for backend API and localhost:5000 for CRM API in development
    const connectSrc = window.location.hostname === 'localhost'
      ? "'self' http://localhost:5001 http://localhost:5000 ws://localhost:*"
      : "'self'";

    cspMeta.content = `
      default-src 'self';
      script-src 'self' 'nonce-${this.nonce}' 'strict-dynamic';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src ${connectSrc};
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim();

    document.head.appendChild(cspMeta);
  }

  initIntegrityChecks() {
    document.querySelectorAll('script[src], link[rel="stylesheet"]').forEach(element => {
      const src = element.src || element.href;
      if (!element.integrity && src && !src.startsWith(location.origin)) {
        console.warn('Missing SRI for external resource:', src);
      }
    });
  }

  preventClickjacking() {
    if (window.self !== window.top) {
      console.warn('Possible clickjacking attempt detected');
    }
  }

  sanitizeHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;

    const scripts = template.content.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    const elements = template.content.querySelectorAll('*');
    elements.forEach(element => {
      for (const attr of element.attributes) {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      }
    });

    return template.innerHTML;
  }

  validateInput(input, type) {
    const validators = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      numeric: /^\d+$/
    };

    if (validators[type]) {
      return validators[type].test(input);
    }

    return false;
  }

  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  getNonce() {
    return this.nonce;
  }
}

export default SecurityManager;
