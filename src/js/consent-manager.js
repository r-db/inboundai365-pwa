// GDPR-Compliant Consent Manager
export class ConsentManager {
  constructor() {
    this.consentKey = 'user_consent';
    this.consentVersion = '1.0.0';
    this.consent = this.loadConsent();
    this.init();
  }

  init() {
    if (!this.hasValidConsent()) {
      setTimeout(() => this.showConsentBanner(), 2000);
    } else {
      this.applyConsent();
    }
  }

  loadConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === this.consentVersion) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading consent:', e);
    }
    return null;
  }

  saveConsent(consent) {
    const consentData = {
      ...consent,
      version: this.consentVersion,
      timestamp: Date.now(),
      id: this.generateConsentId()
    };

    localStorage.setItem(this.consentKey, JSON.stringify(consentData));
    this.consent = consentData;
    this.recordConsent(consentData);
  }

  generateConsentId() {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hasValidConsent() {
    if (!this.consent) return false;

    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    if (this.consent.timestamp < sixMonthsAgo) {
      return false;
    }

    return true;
  }

  showConsentBanner() {
    if (document.querySelector('.consent-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.setAttribute('aria-describedby', 'consent-description');

    banner.innerHTML = `
      <div class="consent-content">
        <h2 id="consent-title">Cookie Consent</h2>
        <p id="consent-description">
          We use cookies to enhance your experience. By continuing to visit this site
          you agree to our use of cookies.
        </p>
        <div class="consent-options">
          <label>
            <input type="checkbox" name="necessary" checked disabled>
            <span>Necessary (required)</span>
          </label>
          <label>
            <input type="checkbox" name="analytics" checked>
            <span>Analytics</span>
          </label>
          <label>
            <input type="checkbox" name="marketing">
            <span>Marketing</span>
          </label>
          <label>
            <input type="checkbox" name="preferences">
            <span>Preferences</span>
          </label>
        </div>
        <div class="consent-actions">
          <button class="consent-reject" type="button">Reject All</button>
          <button class="consent-settings" type="button">Save Settings</button>
          <button class="consent-accept" type="button">Accept All</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector('.consent-accept').addEventListener('click', () => {
      this.acceptAll();
      this.removeBanner();
    });

    banner.querySelector('.consent-reject').addEventListener('click', () => {
      this.rejectAll();
      this.removeBanner();
    });

    banner.querySelector('.consent-settings').addEventListener('click', () => {
      this.saveCustomConsent();
      this.removeBanner();
    });

    requestAnimationFrame(() => {
      banner.classList.add('consent-banner--visible');
    });
  }

  acceptAll() {
    this.saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
    this.applyConsent();
  }

  rejectAll() {
    this.saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    });
    this.applyConsent();
  }

  saveCustomConsent() {
    const banner = document.querySelector('.consent-banner');
    const consent = {
      necessary: true,
      analytics: banner.querySelector('[name="analytics"]').checked,
      marketing: banner.querySelector('[name="marketing"]').checked,
      preferences: banner.querySelector('[name="preferences"]').checked
    };

    this.saveConsent(consent);
    this.applyConsent();
  }

  removeBanner() {
    const banner = document.querySelector('.consent-banner');
    if (banner) {
      banner.classList.remove('consent-banner--visible');
      setTimeout(() => banner.remove(), 300);
    }
  }

  applyConsent() {
    if (!this.consent) return;

    window.dispatchEvent(new CustomEvent('consentChanged', {
      detail: this.consent
    }));
  }

  async recordConsent(consentData) {
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      });
    } catch (error) {
      console.error('Failed to record consent:', error);
    }
  }

  getConsent() {
    return this.consent;
  }

  hasConsent(type) {
    return this.consent?.[type] === true;
  }
}

export default ConsentManager;
