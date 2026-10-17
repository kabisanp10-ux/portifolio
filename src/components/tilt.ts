import type { TiltCardOptions } from '../types';

/**
 * CardTiltEngine
 * Implements smooth 3D perspective rotation on hover with spotlight tracking.
 */
export class CardTiltEngine {
  private cards: NodeListOf<HTMLElement>;
  private maxTilt: number;
  private perspective: number;

  constructor(options: TiltCardOptions = {}) {
    this.maxTilt = options.maxTiltDegrees ?? 8.0;
    this.perspective = options.perspective ?? 1000;
    this.cards = document.querySelectorAll<HTMLElement>('.tilt-card');

    this.init();
  }

  private init(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch || !this.cards.length) return;

    this.cards.forEach((card) => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -((y - centerY) / centerY) * this.maxTilt;
        const rotateY = ((x - centerX) / centerX) * this.maxTilt;

        card.style.transform = `perspective(${this.perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
      });
    });
  }
}
