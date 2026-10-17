/**
 * NavigationController
 * Manages mobile drawer toggle, active link scrollspy, and smooth jumps.
 */
export class NavigationController {
  private mobileToggle: HTMLButtonElement | null;
  private mobileDrawer: HTMLElement | null;
  private mobileLinks: NodeListOf<HTMLAnchorElement>;
  private navLinks: NodeListOf<HTMLAnchorElement>;
  private sections: NodeListOf<HTMLElement>;

  constructor() {
    this.mobileToggle = document.getElementById('mobile-menu-toggle') as HTMLButtonElement | null;
    this.mobileDrawer = document.getElementById('mobile-nav-drawer');
    this.mobileLinks = document.querySelectorAll<HTMLAnchorElement>('.mobile-nav-link');
    this.navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
    this.sections = document.querySelectorAll<HTMLElement>('section[id]');

    this.bindEvents();
  }

  private bindEvents(): void {
    // Mobile Drawer Toggle
    if (this.mobileToggle && this.mobileDrawer) {
      this.mobileToggle.addEventListener('click', () => {
        this.mobileDrawer?.classList.toggle('open');
      });

      this.mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
          this.mobileDrawer?.classList.remove('open');
        });
      });
    }

    // ScrollSpy
    window.addEventListener('scroll', () => {
      let currentId = '';
      const scrollPos = window.scrollY + 220;

      this.sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = section.getAttribute('id') ?? '';
        }
      });

      this.navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }
}
