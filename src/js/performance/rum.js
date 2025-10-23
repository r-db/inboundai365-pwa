// Real User Monitoring
export class RUMCollector {
  constructor() {
    this.queue = [];
    this.observer = null;
    this.metrics = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      inp: null
    };
    this.init();
  }

  init() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.observeLCP();
      this.observeCLS();
      this.observeINP();
      this.observeFCP();
      this.observeFID();
    }

    // Measure TTFB
    this.measureTTFB();

    // Flush on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    // Flush before unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  observeLCP() {
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const value = lastEntry.renderTime || lastEntry.loadTime;
        this.metrics.lcp = value;
        this.track('lcp', value);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP observation not supported', e);
    }
  }

  observeCLS() {
    try {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.track('cls', clsValue);
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS observation not supported', e);
    }
  }

  observeINP() {
    try {
      let maxDuration = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.interactionId) {
            maxDuration = Math.max(maxDuration, entry.duration);
            this.metrics.inp = maxDuration;
            this.track('inp', maxDuration);
          }
        });
      }).observe({ type: 'event', buffered: true, durationThreshold: 0 });
    } catch (e) {
      console.warn('INP observation not supported', e);
    }
  }

  observeFCP() {
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.track('fcp', entry.startTime);
          }
        });
      }).observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('FCP observation not supported', e);
    }
  }

  observeFID() {
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const value = entry.processingStart - entry.startTime;
          this.metrics.fid = value;
          this.track('fid', value);
        });
      }).observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID observation not supported', e);
    }
  }

  measureTTFB() {
    try {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      if (navigationTiming) {
        const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
        this.metrics.ttfb = ttfb;
        this.track('ttfb', ttfb);
      }
    } catch (e) {
      console.warn('TTFB measurement not supported', e);
    }
  }

  track(metric, value) {
    this.queue.push({
      metric,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      connection: navigator.connection?.effectiveType || 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    });

    // Auto-flush if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  flush() {
    if (this.queue.length === 0) return;

    const data = [...this.queue];
    this.queue = [];

    // RUM endpoint not configured - log locally only
    console.log('[RUM] Performance metrics collected:', data.length, 'events');
    // Uncomment when RUM endpoint is ready:
    // if (navigator.sendBeacon) {
    //   navigator.sendBeacon('/api/rum', JSON.stringify(data));
    // } else {
    //   fetch('/api/rum', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //     keepalive: true
    //   }).catch(err => console.error('Failed to send RUM data', err));
    // }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

export default RUMCollector;
