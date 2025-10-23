// Speculation Rules Manager
export class SpeculationManager {
  constructor() {
    this.isSupported = HTMLScriptElement.supports?.('speculationrules');
    this.rulesScript = null;
    this.dynamicRulesScript = null;
    this.init();
  }

  init() {
    if (!this.isSupported) {
      console.log('Speculation Rules API not supported');
      return;
    }

    this.setupBaseRules();
    this.monitorUserBehavior();

    window.addEventListener('pagehide', () => this.cleanup());
  }

  setupBaseRules() {
    const rules = {
      prefetch: [
        {
          source: "document",
          where: {
            and: [
              { href_matches: "/*" },
              { not: { href_matches: "/logout" } },
              { not: { href_matches: "/api/*" } }
            ]
          },
          eagerness: "moderate"
        }
      ]
    };

    this.addRules(rules);
  }

  addRules(rules) {
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify(rules);
    document.head.appendChild(script);

    this.rulesScript = script;
  }

  monitorUserBehavior() {
    let hoverTimeout;

    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !this.shouldSpeculate(link)) return;

      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.addDynamicRule(link.href, 'prefetch');
      }, 200);
    }, { passive: true });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    }, { passive: true });
  }

  shouldSpeculate(link) {
    if (link.hostname !== location.hostname) return false;
    if (link.hasAttribute('download')) return false;

    const destructivePatterns = ['/logout', '/delete', '/remove'];
    if (destructivePatterns.some(pattern => link.pathname.includes(pattern))) {
      return false;
    }

    if (this.userPrefersReducedData()) return false;

    return true;
  }

  userPrefersReducedData() {
    return (
      navigator.connection?.saveData ||
      navigator.connection?.effectiveType === 'slow-2g' ||
      navigator.connection?.effectiveType === '2g'
    );
  }

  addDynamicRule(url, type = 'prefetch') {
    if (!this.isSupported) return;

    const newRules = {
      [type]: [
        {
          source: "list",
          urls: [url]
        }
      ]
    };

    if (this.dynamicRulesScript) {
      this.dynamicRulesScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify(newRules);
    document.head.appendChild(script);

    this.dynamicRulesScript = script;
  }

  cleanup() {
    if (this.rulesScript) {
      this.rulesScript.remove();
    }
    if (this.dynamicRulesScript) {
      this.dynamicRulesScript.remove();
    }
  }
}

export default SpeculationManager;
