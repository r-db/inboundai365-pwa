// Scroll Animation System
export class ScrollAnimations {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Create Intersection Observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Optionally unobserve after revealing
            // this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Observe all elements with scroll-reveal classes
    this.observeElements();

    // Listen for navigation events to refresh animations
    window.addEventListener('popstate', () => {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setTimeout(() => this.refresh(), 50);
      });
    });

    // Listen for view transitions - this is critical for SPA navigation
    window.addEventListener('viewtransition', () => {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setTimeout(() => this.refresh(), 50);
      });
    });

    // Also listen for DOMContentLoaded in case we're on initial page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(() => {
          this.refresh();
        });
      });
    }
  }

  observeElements() {
    const elements = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );

    elements.forEach(el => {
      // Check if element is already in viewport on load
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInViewport) {
        // Immediately reveal if already visible
        el.classList.add('revealed');
      }

      this.observer.observe(el);
    });
  }

  // Method to refresh observer (useful when new elements are added)
  refresh() {
    // First, remove 'revealed' class from all animated elements to reset them
    const allAnimatedElements = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );
    allAnimatedElements.forEach(el => {
      el.classList.remove('revealed');
    });

    // Disconnect and reconnect to pick up new elements
    if (this.observer) {
      this.observer.disconnect();
    }

    // Re-observe all elements (including new ones)
    this.observeElements();
  }

  // Cleanup method
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Auto-initialize if document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollAnimations = new ScrollAnimations();
  });
} else {
  window.scrollAnimations = new ScrollAnimations();
}
