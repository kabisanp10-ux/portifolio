import * as THREE from 'three';
import type { ThreeEngineConfig, MousePhysicsState } from './types';

/**
 * ThreeNexusEngine
 * Manages the interactive 3D WebGL Business Growth Nexus, dual polyhedra,
 * instanced vertex nodes, orbital particle cloud, and mouse/scroll physics.
 */
export class ThreeNexusEngine {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private masterGroup: THREE.Group;

  private outerMesh: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial>;
  private innerMesh: THREE.Mesh<THREE.DodecahedronGeometry, THREE.MeshBasicMaterial>;
  private nodeInstanced: THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private particlePoints: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;

  private mouse: MousePhysicsState = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private scrollProgress: number = 0;
  private clock: THREE.Clock;
  private prefersReducedMotion: boolean = false;
  private isDestroyed: boolean = false;

  constructor(config: ThreeEngineConfig) {
    const canvasElement = document.getElementById(config.canvasId) as HTMLCanvasElement | null;
    if (!canvasElement) {
      throw new Error(`Canvas element with ID '${config.canvasId}' not found.`);
    }
    this.canvas = canvasElement;

    // Check WebGL availability
    const gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!gl) {
      throw new Error('WebGL is not supported on this browser/device.');
    }

    // Initialize Scene, Camera & Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 24;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.masterGroup = new THREE.Group();
    this.scene.add(this.masterGroup);
    this.clock = new THREE.Clock();

    // Build 3D Elements
    const outerRadius = config.outerRadius ?? 7.8;
    const innerRadius = config.innerRadius ?? 4.4;
    const particleCount = config.particleCount ?? 480;

    // 1. Outer Geodesic Icosahedron (Deep Corporate Navy)
    const outerGeo = new THREE.IcosahedronGeometry(outerRadius, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    this.outerMesh = new THREE.Mesh(outerGeo, outerMat);
    this.masterGroup.add(this.outerMesh);

    // 2. Inner Dodecahedron Core (Matte Gold)
    const innerGeo = new THREE.DodecahedronGeometry(innerRadius, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xc6a15b,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    this.innerMesh = new THREE.Mesh(innerGeo, innerMat);
    this.masterGroup.add(this.innerMesh);

    // 3. Instanced Vertex Nodes (Matte Brass / Gold)
    const posAttr = outerGeo.attributes.position;
    const nodeCount = posAttr.count;
    const nodeGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
    this.nodeInstanced = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      dummy.updateMatrix();
      this.nodeInstanced.setMatrixAt(i, dummy.matrix);
    }
    this.masterGroup.add(this.nodeInstanced);

    // 4. Orbital Particle Galaxy (Matte Gold, Navy, Brass, Slate)
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colGold = new THREE.Color(0xc6a15b);
    const colNavy = new THREE.Color(0x0f172a);
    const colBrass = new THREE.Color(0xd4af37);
    const colSlate = new THREE.Color(0x64748b);

    for (let i = 0; i < particleCount; i++) {
      const radius = 9.5 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const r = Math.random();
      const chosenColor = r < 0.45 ? colGold : r < 0.75 ? colNavy : r < 0.9 ? colBrass : colSlate;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });
    this.particlePoints = new THREE.Points(particleGeo, particleMat);
    this.masterGroup.add(this.particlePoints);

    // Check motion preferences
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Register event listeners
    this.bindEvents();

    // Start render loop
    this.render();
  }

  private bindEvents(): void {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    window.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouse.x = (e.clientX - halfWidth) * 0.0014;
      this.mouse.y = (e.clientY - halfHeight) * 0.0014;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private render = (): void => {
    if (this.isDestroyed) return;
    requestAnimationFrame(this.render);

    if (document.hidden) return;

    const elapsed = this.clock.getElapsedTime();

    if (!this.prefersReducedMotion) {
      // Rotation dynamics
      this.outerMesh.rotation.y += 0.0024;
      this.outerMesh.rotation.x += 0.0012;

      this.innerMesh.rotation.y -= 0.0036;
      this.innerMesh.rotation.z += 0.0018;

      this.particlePoints.rotation.y += 0.0009;

      // Mouse Lerp Physics
      this.mouse.targetX += (this.mouse.x - this.mouse.targetX) * 0.055;
      this.mouse.targetY += (this.mouse.y - this.mouse.targetY) * 0.055;

      this.masterGroup.rotation.y = this.mouse.targetX * 1.6;
      this.masterGroup.rotation.x = this.mouse.targetY * 1.6;

      // Camera Scroll Traversal
      this.masterGroup.position.y = (this.scrollProgress - 0.5) * 6;
      this.camera.position.z = 24 - this.scrollProgress * 7;

      // Pulse Scale
      const pulse = 1 + Math.sin(elapsed * 1.3) * 0.03;
      this.innerMesh.scale.set(pulse, pulse, pulse);
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.isDestroyed = true;
    this.renderer.dispose();
  }
}
