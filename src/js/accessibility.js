// Accessibility Manager (WCAG 2.2 AA)
export class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupSkipLinks();
    this.setupARIALive();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupReducedMotion();
    this.setupScreenReaderAnnouncements();
  }

  setupSkipLinks() {
    if (document.querySelector('.skip-link')) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';

    document.body.insertBefore(skipLink, document.body.firstChild);

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.getElementById('main-content');
      if (main) {
        main.tabIndex = -1;
        main.focus();
        main.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  setupARIALive() {
    if (document.getElementById('aria-live-region')) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'aria-live-region';

    document.body.appendChild(liveRegion);
  }

  announce(message, priority = 'polite') {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;

      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      const modal = document.querySelector('[role="dialog"]:not([hidden])');
      if (modal && e.key === 'Tab') {
        this.trapFocus(modal, e);
      }

      if (e.key === 'Escape' && modal) {
        this.closeModal(modal);
      }
    });

    this.enhanceCustomComponents();
  }

  trapFocus(container, event) {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  setupFocusManagement() {
    const style = document.createElement('style');
    style.textContent = `
      :focus-visible {
        outline: 3px solid var(--color-primary, #0066cc);
        outline-offset: 2px;
      }

      *:focus:not(:focus-visible) {
        outline: none;
      }

      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--color-primary, #0066cc);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
      }

      .skip-link:focus {
        top: 0;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);
  }

  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReducedMotion = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    };

    handleReducedMotion(prefersReducedMotion);
    prefersReducedMotion.addEventListener('change', handleReducedMotion);
  }

  setupScreenReaderAnnouncements() {
    let previousTitle = document.title;

    const observer = new MutationObserver(() => {
      if (document.title !== previousTitle) {
        this.announce(`Navigated to ${document.title}`);
        previousTitle = document.title;
      }
    });

    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  enhanceCustomComponents() {
    document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
      this.enhanceDropdown(dropdown);
    });

    document.querySelectorAll('[role="tablist"]').forEach(tablist => {
      this.enhanceTabs(tablist);
    });
  }

  enhanceDropdown(dropdown) {
    const button = dropdown.querySelector('[aria-haspopup="true"]');
    const menu = dropdown.querySelector('[role="menu"]');

    if (!button || !menu) return;

    button.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        menu.hidden = false;
        menu.querySelector('[role="menuitem"]')?.focus();
      }
    });

    menu.addEventListener('keydown', (e) => {
      const items = [...menu.querySelectorAll('[role="menuitem"]')];
      const currentIndex = items.indexOf(document.activeElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          items[(currentIndex + 1) % items.length]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          items[(currentIndex - 1 + items.length) % items.length]?.focus();
          break;
        case 'Escape':
          menu.hidden = true;
          button.focus();
          break;
        case 'Home':
          e.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    });
  }

  enhanceTabs(tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab =>
      document.getElementById(tab.getAttribute('aria-controls'))
    );

    tabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        let newIndex = index;

        switch (e.key) {
          case 'ArrowRight':
            newIndex = (index + 1) % tabs.length;
            break;
          case 'ArrowLeft':
            newIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case 'Home':
            newIndex = 0;
            break;
          case 'End':
            newIndex = tabs.length - 1;
            break;
          default:
            return;
        }

        e.preventDefault();
        this.activateTab(tabs, panels, newIndex);
      });

      tab.addEventListener('click', () => {
        this.activateTab(tabs, panels, index);
      });
    });
  }

  activateTab(tabs, panels, index) {
    tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', isSelected);
      tab.tabIndex = isSelected ? 0 : -1;

      const panel = panels[i];
      if (panel) {
        panel.hidden = !isSelected;
      }
    });

    tabs[index].focus();
  }

  closeModal(modal) {
    modal.hidden = true;
    const trigger = document.querySelector(`[aria-controls="${modal.id}"]`);
    if (trigger) trigger.focus();
  }
}

export default AccessibilityManager;
