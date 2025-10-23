// Core Web Vitals Optimizer
export class CoreWebVitalsOptimizer {
  constructor() {
    this.metrics = {
      lcp: { target: 1500, current: null },
      inp: { target: 200, current: null },
      cls: { target: 0.1, current: null }
    };
    this.init();
  }

  init() {
    this.measureVitals();
    this.optimizeLCP();
    this.optimizeINP();
    this.optimizeCLS();
  }

  measureVitals() {
    if (!('PerformanceObserver' in window)) return;

    // LCP measurement
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp.current = lastEntry.renderTime || lastEntry.loadTime;
        this.checkMetric('lcp');
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}

    // CLS measurement
    try {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls.current = clsValue;
        this.checkMetric('cls');
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}

    // INP measurement
    try {
      let inpValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId) {
            inpValue = Math.max(inpValue, entry.duration);
            this.metrics.inp.current = inpValue;
            this.checkMetric('inp');
          }
        }
      }).observe({ type: 'event', buffered: true, durationThreshold: 0 });
    } catch (e) {}
  }

  checkMetric(metric) {
    const { target, current } = this.metrics[metric];

    if (current > target) {
      console.warn(`${metric.toUpperCase()} exceeds target: ${current.toFixed(2)} > ${target}`);
      this.reportToMonitoring(metric, current);
    }
  }

  optimizeLCP() {
    // Preload critical resources
    const criticalImages = document.querySelectorAll('img[loading="eager"], img[data-priority="high"]');
    criticalImages.forEach(img => {
      if (img.src && !document.querySelector(`link[rel="preload"][href="${img.src}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        if (img.srcset) {
          link.imageSrcset = img.srcset;
        }
        document.head.appendChild(link);
      }
    });

    // Preconnect to required origins
    const origins = new Set();
    document.querySelectorAll('link[href], script[src], img[src]').forEach(element => {
      const url = element.href || element.src;
      if (url) {
        try {
          const origin = new URL(url).origin;
          if (origin !== location.origin) {
            origins.add(origin);
          }
        } catch (e) {}
      }
    });

    origins.forEach(origin => {
      if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        document.head.appendChild(link);
      }
    });

    // Set fetchpriority on LCP element
    setTimeout(() => {
      const lcpElement = this.identifyLCPElement();
      if (lcpElement && lcpElement.tagName === 'IMG') {
        lcpElement.setAttribute('fetchpriority', 'high');
      }
    }, 0);
  }

  optimizeINP() {
    // Defer non-critical JavaScript
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (!script.async && !script.defer && !script.hasAttribute('data-critical')) {
        script.defer = true;
      }
    });

    // Break up long tasks
    this.implementIdleCallback();

    // Optimize event handlers
    this.optimizeEventHandlers();
  }

  optimizeCLS() {
    // Set dimensions for images and videos
    document.querySelectorAll('img:not([width]), video:not([width])').forEach(media => {
      if (media.naturalWidth && !media.width) {
        media.width = media.naturalWidth;
      }
      if (media.naturalHeight && !media.height) {
        media.height = media.naturalHeight;
      }
    });

    // Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();

    // Prevent font loading shifts
    this.optimizeFontLoading();
  }

  identifyLCPElement() {
    // Simple heuristic to identify likely LCP element
    const images = document.querySelectorAll('img');
    let largest = null;
    let largestSize = 0;

    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      const size = rect.width * rect.height;

      if (size > largestSize && rect.top < window.innerHeight) {
        largest = img;
        largestSize = size;
      }
    });

    return largest;
  }

  implementIdleCallback() {
    if (!window.scheduleTask) {
      window.scheduleTask = (callback, priority = 'low') => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(callback, {
            timeout: priority === 'high' ? 100 : 1000
          });
        } else {
          setTimeout(callback, priority === 'high' ? 0 : 100);
        }
      };
    }
  }

  optimizeEventHandlers() {
    // Make all passive where possible
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
    passiveEvents.forEach(event => {
      document.addEventListener(event, () => {}, { passive: true, capture: true });
    });
  }

  reserveSpaceForDynamicContent() {
    // Add skeleton screens for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');

    dynamicContainers.forEach(container => {
      if (!container.children.length && !container.style.minHeight) {
        container.style.minHeight = container.dataset.minHeight || '100px';
      }
    });
  }

  optimizeFontLoading() {
    // Preload critical fonts
    const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');

    if (fontPreloads.length === 0) {
      // Add font-display: swap to all font faces
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  }

  reportToMonitoring(metric, value) {
    // Send to monitoring service
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', JSON.stringify({
        metric,
        value,
        timestamp: Date.now(),
        url: location.href,
        userAgent: navigator.userAgent
      }));
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

export default CoreWebVitalsOptimizer;
