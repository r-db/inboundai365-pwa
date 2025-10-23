// Main Application Entry Point
// Import CSS
import '../css/design-tokens.css';
import '../css/main.css';
import '../css/view-transitions.css';
import '../css/chat.css';

import { RUMCollector } from './performance/rum.js';
import { CoreWebVitalsOptimizer } from './performance/cwv-optimizer.js';
import { ViewTransitionManager } from './view-transitions.js';
import { NavigationController } from './navigation.js';
import { StateManager } from './state-manager.js';
import { SecurityManager } from './security.js';
import { APIAdapter } from './api-adapter.js';
import { StorageManager } from './storage-manager.js';
import { OfflineQueue } from './offline-queue.js';
import { ErrorBoundary } from './error-boundary.js';
import { AccessibilityManager } from './accessibility.js';
import { ConsentManager } from './consent-manager.js';
import { PrivacyAnalytics } from './analytics.js';
import { SpeculationManager } from './speculation-rules.js';
import { MediaHandler } from './media-handler.js';
import { PWADebugger } from './debugger.js';
import { ScrollAnimations } from './scroll-animations.js';
import ChatUI from './chat-ui.js';
import ChatClient from './chat-client.js';
import CRMClient from './crm-client.js';

// Make CRM Client available globally immediately (before chat.js initializes)
window.CRMClient = CRMClient;

import { RobustChat } from './chat.js';

class PWAApp {
  constructor() {
    this.modules = {};
    this.state = null;
    this.api = null;
    this.debugger = null;
    this.init();
  }

  async init() {
    try {
      // Initialize error handling first
      this.modules.errorBoundary = new ErrorBoundary();

      // Initialize security
      this.modules.security = new SecurityManager();

      // Initialize storage
      this.modules.storage = new StorageManager();
      await this.modules.storage.init();

      // Initialize state management
      this.state = new StateManager({
        user: {},
        app: {
          isOnline: navigator.onLine,
          isInstalled: false,
          theme: 'light'
        },
        data: {}
      });

      // Initialize API adapter
      this.api = new APIAdapter({
        baseURL: '/api',
        timeout: 7000
      });

      // Initialize consent management
      this.modules.consent = new ConsentManager();

      // Initialize analytics with consent manager
      this.modules.analytics = new PrivacyAnalytics(this.modules.consent);

      // Initialize performance monitoring
      this.modules.rum = new RUMCollector();
      this.modules.cwv = new CoreWebVitalsOptimizer();

      // Initialize view transitions
      this.modules.viewTransitions = new ViewTransitionManager();

      // Initialize navigation
      this.modules.navigation = new NavigationController();

      // Initialize accessibility
      this.modules.accessibility = new AccessibilityManager();

      // Initialize offline queue
      this.modules.offlineQueue = new OfflineQueue();
      await this.modules.offlineQueue.init();

      // Initialize speculation rules
      this.modules.speculation = new SpeculationManager();

      // Initialize media handler
      this.modules.media = new MediaHandler();

      // Initialize scroll animations
      this.modules.scrollAnimations = new ScrollAnimations();

      // Initialize chat UI (if on chat page)
      if (this.isOnChatPage()) {
        this.modules.chatUI = new ChatUI();
      }

      // Initialize debugger (development only)
      this.debugger = new PWADebugger();

      // Setup service worker
      await this.registerServiceWorker();

      // Setup app event listeners
      this.setupEventListeners();

      // Check for PWA installation
      this.checkInstallation();

      // Initialize theme
      this.initTheme();

      console.log('PWA App initialized successfully');

    } catch (error) {
      console.error('Failed to initialize PWA App:', error);
    }
  }

  async registerServiceWorker() {
    // Skip service worker registration in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Development] Service Worker registration skipped');

      // Unregister any existing service workers in development
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('[Development] Unregistered existing Service Worker');
        }
      }
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Install button - always set up the listener
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.addEventListener('click', () => this.promptInstall());
    }

    // Online/Offline status
    window.addEventListener('online', () => {
      this.state.state.app.isOnline = true;
      this.modules.accessibility.announce('Connection restored');
    });

    window.addEventListener('offline', () => {
      this.state.state.app.isOnline = false;
      this.modules.accessibility.announce('Connection lost. Working offline');
    });

    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      // Button is already visible, just update the prompt
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      this.state.state.app.isInstalled = true;
      this.modules.analytics.track('app_installed');
      const installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.textContent = 'Already Installed';
        installButton.disabled = true;
      }
    });

    // View transition events
    window.addEventListener('viewtransition', (e) => {
      this.modules.analytics.track('page_view', { url: e.detail.url });
    });
  }

  checkInstallation() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.state.state.app.isInstalled = true;
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.state.state.app.theme = theme;
    localStorage.setItem('theme', theme);

    // Update icon visibility
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');

    if (lightIcon && darkIcon) {
      if (theme === 'dark') {
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
      } else {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
      }
    }
  }

  toggleTheme() {
    const newTheme = this.state.state.app.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  showInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'inline-flex';
      installButton.addEventListener('click', () => this.promptInstall());
    }
  }

  async promptInstall() {
    const installButton = document.getElementById('install-button');

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || localStorage.getItem('pwa-installed')) {
      if (installButton) {
        installButton.textContent = 'Already Installed';
        installButton.disabled = true;
      }
      return;
    }

    if (!this.deferredPrompt) {
      // Create mock installation dialog for demonstration
      this.showMockInstallDialog();
      return;
    }

    // Use real browser install prompt if available
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    this.modules.analytics.track('install_prompt', { outcome });

    this.deferredPrompt = null;
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  showMockInstallDialog() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'install-modal-overlay';
    overlay.innerHTML = `
      <div class="install-modal">
        <div class="install-modal__header">
          <h3 class="install-modal__title">Install PWA Template 2025</h3>
          <button class="install-modal__close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="install-modal__body">
          <div class="install-modal__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
          </div>
          <p class="install-modal__description">
            This app can be installed on your device. It will work offline and provide a native app experience.
          </p>
          <ul class="install-modal__features">
            <li>✓ Works offline</li>
            <li>✓ Fast performance</li>
            <li>✓ Push notifications</li>
            <li>✓ No app store required</li>
          </ul>
        </div>
        <div class="install-modal__footer">
          <button class="install-modal__cancel btn btn--secondary">Cancel</button>
          <button class="install-modal__install btn btn--primary">Install</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Handle close
    const closeBtn = overlay.querySelector('.install-modal__close');
    const cancelBtn = overlay.querySelector('.install-modal__cancel');
    const installBtn = overlay.querySelector('.install-modal__install');

    const closeModal = () => {
      overlay.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Handle install
    installBtn.addEventListener('click', () => {
      localStorage.setItem('pwa-installed', 'true');
      this.state.state.app.isInstalled = true;
      this.modules.analytics.track('mock_install');

      const installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.textContent = 'Already Installed';
        installButton.disabled = true;
      }

      closeModal();

      // Show success notification
      if (this.modules.accessibility) {
        this.modules.accessibility.announce('App installed successfully!');
      }

      // Show a success message
      const successNotification = document.createElement('div');
      successNotification.className = 'update-notification';
      successNotification.style.borderLeft = '4px solid var(--color-success, #10b981)';
      successNotification.innerHTML = `
        <div class="update-notification__content">
          <strong>App Installed!</strong>
          <p>PWA Template 2025 has been installed. Open it from your home screen or app menu.</p>
        </div>
        <button class="update-notification__action">OK</button>
      `;
      document.body.appendChild(successNotification);

      successNotification.querySelector('.update-notification__action').addEventListener('click', () => {
        successNotification.remove();
      });

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (successNotification.parentNode) {
          successNotification.remove();
        }
      }, 5000);
    });
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification__content">
        <strong>Update Available</strong>
        <p>A new version is available. Refresh to update.</p>
      </div>
      <button class="update-notification__action">Refresh</button>
    `;

    document.body.appendChild(notification);

    notification.querySelector('.update-notification__action').addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Check if on chat page
  isOnChatPage() {
    return window.location.pathname.includes('chat') ||
           document.querySelector('.chat-container') !== null;
  }

  // Public API for external access
  getState() {
    return this.state.state;
  }

  getAPI() {
    return this.api;
  }

  getModule(name) {
    return this.modules[name];
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new PWAApp();
  });
} else {
  window.app = new PWAApp();
}

export default PWAApp;
