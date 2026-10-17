import * as THREE from 'three';

/* ==========================================================================
   Kabisan P — Interactive 3D WebGL Engine & Luxury Interaction Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThreeJsNexus();
  initTiltSpotlights();
  initNavigation();
  initContactForm();
});

/* --------------------------------------------------------------------------
   1. Interactive 3D WebGL Business Nexus (Three.js)
   -------------------------------------------------------------------------- */
function initThreeJsNexus() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Verify WebGL capability
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
  } catch (e) {
    return;
  }

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    58,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Master 3D Group
  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // A. Outer Geodesic Icosahedron (Deep Corporate Navy)
  const outerGeo = new THREE.IcosahedronGeometry(7.8, 1);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
    wireframe: true,
    transparent: true,
    opacity: 0.22
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  masterGroup.add(outerMesh);

  // B. Inner Core Dodecahedron (Matte Gold)
  const innerGeo = new THREE.DodecahedronGeometry(4.4, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xc6a15b,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  masterGroup.add(innerMesh);

  // C. Glowing Node Vertices (Matte Brass / Gold)
  const vertices = outerGeo.attributes.position.array;
  const nodeGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
  const nodeCount = vertices.length / 3;
  const nodeInstanced = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < nodeCount; i++) {
    dummy.position.set(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]);
    dummy.updateMatrix();
    nodeInstanced.setMatrixAt(i, dummy.matrix);
  }
  masterGroup.add(nodeInstanced);

  // D. Orbiting Planetary Particle Cloud (Matte Gold, Navy, Brass, Slate)
  const particleCount = 480;
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

    const rand = Math.random();
    const chosenColor = rand < 0.45 ? colGold : rand < 0.75 ? colNavy : rand < 0.9 ? colBrass : colSlate;
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

  const particlePoints = new THREE.Points(particleGeo, particleMat);
  masterGroup.add(particlePoints);

  // Mouse & Scroll Parallax State
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let scrollProgress = 0;

  const halfWidth = window.innerWidth / 2;
  const halfHeight = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - halfWidth) * 0.0014;
    mouseY = (e.clientY - halfHeight) * 0.0014;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Reduced Motion Check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();

  function renderLoop() {
    requestAnimationFrame(renderLoop);

    if (document.hidden) return; // Save GPU cycles when tab is unfocused

    const elapsed = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      // Rotation dynamics
      outerMesh.rotation.y += 0.0024;
      outerMesh.rotation.x += 0.0012;

      innerMesh.rotation.y -= 0.0036;
      innerMesh.rotation.z += 0.0018;

      particlePoints.rotation.y += 0.0009;

      // Mouse Physics Lerp Damping
      targetX += (mouseX - targetX) * 0.055;
      targetY += (mouseY - targetY) * 0.055;

      masterGroup.rotation.y = targetX * 1.6;
      masterGroup.rotation.x = targetY * 1.6;

      // Camera Traversal based on scroll
      masterGroup.position.y = (scrollProgress - 0.5) * 6;
      camera.position.z = 24 - scrollProgress * 7;

      // Rhythmic breathing pulse
      const pulse = 1 + Math.sin(elapsed * 1.3) * 0.03;
      innerMesh.scale.set(pulse, pulse, pulse);
    }

    renderer.render(scene, camera);
  }

  renderLoop();
}

/* --------------------------------------------------------------------------
   2. 3D Tilt & Dynamic Spotlight Hover
   -------------------------------------------------------------------------- */
function initTiltSpotlights() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouch) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * 8.0;
      const rotateY = ((x - centerX) / centerX) * 8.0;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

/* --------------------------------------------------------------------------
   3. Floating Navbar, Mobile Menu & Active ScrollSpy
   -------------------------------------------------------------------------- */
function initNavigation() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Active ScrollSpy
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 220;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   4. Interactive Contact Form with Validation
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form || !feedback) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('#form-name')?.value.trim() || '';
    const email = form.querySelector('#form-email')?.value.trim() || '';
    const subject = form.querySelector('#form-subject')?.value.trim() || '';
    const message = form.querySelector('#form-message')?.value.trim() || '';
    const accessKey = form.querySelector('#form-access-key')?.value.trim() || '';

    if (!name || !email || !subject || !message) {
      feedback.className = 'form-feedback';
      feedback.style.display = 'block';
      feedback.style.background = 'rgba(239, 68, 68, 0.15)';
      feedback.style.border = '1px solid rgba(239, 68, 68, 0.35)';
      feedback.style.color = '#b91c1c';
      feedback.textContent = 'Please fill in all fields before sending.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      feedback.className = 'form-feedback';
      feedback.style.display = 'block';
      feedback.style.background = 'rgba(239, 68, 68, 0.15)';
      feedback.style.border = '1px solid rgba(239, 68, 68, 0.35)';
      feedback.style.color = '#b91c1c';
      feedback.textContent = 'Please provide a valid email address.';
      return;
    }

    // Set loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span><svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`;
    }

    const payload = { name, email, subject, message };

    // 1. Save to local browser database (localStorage archive)
    try {
      const stored = JSON.parse(localStorage.getItem('kabisan_contact_submissions') || '[]');
      stored.unshift({ ...payload, id: 'sub_' + Date.now(), timestamp: new Date().toISOString() });
      localStorage.setItem('kabisan_contact_submissions', JSON.stringify(stored));
    } catch (err) {
      console.warn('localStorage save warning:', err);
    }

    // 2. Submit to local Vite backend /api/contact
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Backend not running on static hosts
    }

    // 3. Submit to Web3Forms Cloud if access key is set
    if (accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE') {
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: accessKey,
            name,
            email,
            subject: `[Portfolio Inquiry] ${subject}`,
            message,
            from_name: 'Kabisan P Portfolio'
          })
        });
      } catch (err) {
        console.warn('Web3Forms dispatch warning:', err);
      }
    }

    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Send</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    }

    // Success confirmation
    feedback.className = 'form-feedback success';
    feedback.style.display = 'block';
    feedback.textContent = `Thank you, ${name}! Your message regarding "${subject}" has been received and stored. I look forward to speaking with you.`;
    form.reset();

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 8000);
  });
}
