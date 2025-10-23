// Error Boundary
export class ErrorBoundary {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
    this.reportTimeout = null;
    this.init();
  }

  init() {
    this.setupGlobalHandlers();
    this.setupNetworkErrorHandling();
    this.setupPromiseRejectionHandling();
  }

  setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: 'resource',
          tagName: event.target.tagName,
          source: event.target.src || event.target.href,
          message: 'Resource failed to load',
          timestamp: Date.now()
        });
      }
    }, true);
  }

  setupNetworkErrorHandling() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          this.handleError({
            type: 'network',
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: Date.now()
          });
        }

        return response;
      } catch (error) {
        this.handleError({
          type: 'network',
          url: args[0],
          message: error.message,
          timestamp: Date.now()
        });
        throw error;
      }
    };
  }

  setupPromiseRejectionHandling() {
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        reason: event.reason,
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });
  }

  handleError(error) {
    this.errors.push(error);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught:', error);
    }

    if (this.isCritical(error)) {
      this.reportError(error);
      this.showUserNotification(error);
    }

    this.scheduleErrorReporting();
  }

  isCritical(error) {
    return (
      error.type === 'javascript' ||
      (error.type === 'network' && error.url?.includes('/api/')) ||
      error.type === 'promise'
    );
  }

  showUserNotification(error) {
    const lastNotification = sessionStorage.getItem('last_error_notification');
    const now = Date.now();

    if (lastNotification && now - parseInt(lastNotification) < 30000) {
      return;
    }

    sessionStorage.setItem('last_error_notification', now);

    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
      <div class="error-notification__content">
        <strong>Something went wrong</strong>
        <p>We're experiencing technical difficulties. Please try again.</p>
      </div>
      <button class="error-notification__close" aria-label="Close">×</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 5000);

    notification.querySelector('.error-notification__close').addEventListener('click', () => {
      notification.remove();
    });
  }

  scheduleErrorReporting() {
    if (this.reportTimeout) return;

    this.reportTimeout = setTimeout(() => {
      this.reportErrors();
      this.reportTimeout = null;
    }, 5000);
  }

  reportErrors() {
    if (this.errors.length === 0) return;

    const errors = [...this.errors];
    this.errors = [];

    // Disabled: no error reporting endpoint configured
    console.log('Errors to report:', errors);
    return;

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/errors', JSON.stringify({
        errors,
        context: {
          userAgent: navigator.userAgent,
          url: location.href,
          timestamp: Date.now()
        }
      }));
    }
  }

  reportError(error) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/errors/critical', JSON.stringify({
        error,
        context: {
          userAgent: navigator.userAgent,
          url: location.href,
          timestamp: Date.now()
        }
      }));
    }
  }

  getErrors() {
    return [...this.errors];
  }
}

export default ErrorBoundary;
