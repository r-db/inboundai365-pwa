// Navigation Controller
export class NavigationController {
  constructor() {
    this.toggle = document.querySelector('.nav-toggle');
    this.menu = document.querySelector('#nav-menu');
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.toggle || !this.menu) return;

    this.toggle.addEventListener('click', () => this.toggleMenu());

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-primary') && this.isOpen) {
        this.closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
        this.toggle.focus();
      }
    });

    this.menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.updateState();
  }

  closeMenu() {
    this.isOpen = false;
    this.updateState();
  }

  updateState() {
    this.toggle.setAttribute('aria-expanded', this.isOpen);
    this.menu.hidden = !this.isOpen;

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.menu.classList.toggle('is-open', this.isOpen);
      });
    } else {
      this.menu.classList.toggle('is-open', this.isOpen);
    }

    document.body.classList.toggle('nav-open', this.isOpen);
  }
}

export default NavigationController;
