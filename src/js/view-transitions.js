// View Transitions Manager
export class ViewTransitionManager {
  constructor() {
    this.isSupported = 'startViewTransition' in document;
    this.init();
  }

  init() {
    if (!this.isSupported) {
      console.log('View Transitions API not supported, using standard navigation');
      return;
    }

    // Intercept all navigation
    document.addEventListener('click', this.handleClick.bind(this), { capture: true });

    // Handle browser navigation
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  async handleClick(e) {
    const link = e.target.closest('a');
    if (!link || !this.shouldTransition(link)) return;

    e.preventDefault();
    await this.navigateTo(link.href, link.dataset.transition || 'slide');
  }

  async handlePopState(e) {
    if (this.isSupported) {
      document.documentElement.classList.add('back-transition');
      await this.navigateTo(location.href, 'slide-reverse');
      document.documentElement.classList.remove('back-transition');
    }
  }

  shouldTransition(link) {
    return (
      link.href &&
      link.origin === location.origin &&
      !link.hasAttribute('data-no-transition') &&
      !link.hash &&
      link.target !== '_blank' &&
      !link.download
    );
  }

  async navigateTo(url, transitionType = 'slide') {
    if (!this.isSupported) {
      window.location.href = url;
      return;
    }

    // Set transition type
    document.documentElement.dataset.transitionType = transitionType;

    // Start view transition
    const transition = document.startViewTransition(async () => {
      await this.updateDOM(url);
    });

    try {
      await transition.finished;
      // Update history if not a popstate
      if (!window.event || window.event.type !== 'popstate') {
        history.pushState(null, '', url);
      }
    } catch (err) {
      console.error('View transition failed:', err);
    } finally {
      delete document.documentElement.dataset.transitionType;
    }
  }

  async updateDOM(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      // Update title
      document.title = newDoc.title;

      // Swap main content
      const mainContent = document.querySelector('main');
      const newContent = newDoc.querySelector('main');

      if (mainContent && newContent) {
        mainContent.replaceWith(newContent);
      }

      // Update meta tags
      this.updateMetaTags(newDoc);

      // Re-run scripts if needed
      this.executeScripts(newContent);

      // Dispatch custom event for SPAs
      window.dispatchEvent(new CustomEvent('viewtransition', {
        detail: { url }
      }));

    } catch (error) {
      console.error('Failed to update DOM:', error);
      window.location.href = url;
    }
  }

  updateMetaTags(newDoc) {
    const metaSelectors = [
      'meta[property^="og:"]',
      'meta[name="description"]',
      'meta[name="keywords"]',
      'link[rel="canonical"]'
    ];

    metaSelectors.forEach(selector => {
      const oldTags = document.querySelectorAll(selector);
      const newTags = newDoc.querySelectorAll(selector);

      oldTags.forEach(tag => tag.remove());
      newTags.forEach(tag => {
        document.head.appendChild(tag.cloneNode(true));
      });
    });
  }

  executeScripts(container) {
    if (!container) return;

    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
}

export default ViewTransitionManager;
