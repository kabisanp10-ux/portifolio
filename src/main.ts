import './styles/index.css';
import { ThreeNexusEngine } from './three/three-scene';
import { CardTiltEngine } from './components/tilt';
import { NavigationController } from './components/navigation';
import { ContactFormController } from './components/contact';

/**
 * Kabisan P — Portfolio Application Initializer
 * Orchestrates 3D Three.js WebGL Engine, 3D card tilt physics, navigation, and contact handling.
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Initialize Three.js 3D WebGL Business Nexus
    new ThreeNexusEngine({
      canvasId: 'bg-canvas',
      particleCount: 480,
      outerRadius: 7.8,
      innerRadius: 4.4
    });
  } catch (error) {
    console.warn('3D WebGL Engine initialization notice:', error);
  }

  // 2. Initialize 3D Card Perspective Tilt
  new CardTiltEngine({
    maxTiltDegrees: 8.0,
    perspective: 1000
  });

  // 3. Initialize Navigation & ScrollSpy
  new NavigationController();

  // 4. Initialize Interactive Contact Form
  new ContactFormController();
});
