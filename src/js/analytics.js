// Privacy-First Analytics
export class PrivacyAnalytics {
  constructor(consentManager) {
    this.consentManager = consentManager;
    this.queue = [];
    this.sessionId = this.generateSessionId();
    this.pageViewStart = Date.now();
    this.init();
  }

  init() {
    if (!this.hasConsent()) {
      console.log('Analytics disabled - no consent');
      return;
    }

    this.trackPageView();
    this.trackVitals();
    this.trackEngagement();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    window.addEventListener('consentChanged', () => {
      if (this.hasConsent()) {
        this.init();
      }
    });
  }

  hasConsent() {
    return this.consentManager?.hasConsent('analytics') ?? true;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(event, data = {}) {
    if (!this.hasConsent()) return;

    this.queue.push({
      event,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: this.getPageInfo()
    });

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  trackPageView() {
    this.track('page_view', {
      referrer: document.referrer,
      title: document.title,
      path: window.location.pathname
    });

    window.addEventListener('beforeunload', () => {
      this.track('page_exit', {
        duration: Date.now() - this.pageViewStart
      });
      this.flush();
    });
  }

  trackVitals() {
    if (!('PerformanceObserver' in window)) return;

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.track('web_vital', {
          metric: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.track('web_vital', {
          metric: 'CLS',
          value: clsValue
        });
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  }

  trackEngagement() {
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercentage = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;

        [25, 50, 75, 90].forEach(milestone => {
          if (maxScroll >= milestone && maxScroll - 5 < milestone) {
            this.track('scroll_depth', { depth: milestone });
          }
        });
      }
    }, { passive: true });

    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        this.track('click', {
          element: target.tagName,
          text: target.textContent?.substring(0, 50),
          href: target.href
        });
      }
    }, { passive: true });
  }

  getPageInfo() {
    return {
      url: window.location.href,
      title: document.title,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  flush() {
    if (this.queue.length === 0 || !this.hasConsent()) return;

    const data = [...this.queue];
    this.queue = [];

    // Analytics endpoint not configured - log locally only
    console.log('[Analytics] Metrics collected:', data.length, 'events');
    // Uncomment when analytics endpoint is ready:
    // if (navigator.sendBeacon) {
    //   navigator.sendBeacon('/api/analytics', JSON.stringify(data));
    // } else {
    //   fetch('/api/analytics', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //     keepalive: true
    //   }).catch(() => {});
    // }
  }
}

export default PrivacyAnalytics;
