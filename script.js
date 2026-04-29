/**
 * Landing Page — script.js
 * Entrance animations + ambient particle background
 */

(function () {
  'use strict';

  /* =============================================
     1. ENTRANCE ANIMATIONS
     ============================================= */
  function initAnimations() {
    const items = document.querySelectorAll('.anim-item');
    items.forEach((item) => {
      const delay = parseInt(item.dataset.delay || 0, 10);
      setTimeout(() => {
        item.classList.add('is-visible');
      }, 300 + delay * 120);
    });
  }

  /* =============================================
     2. PARTICLE BACKGROUND
     ============================================= */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId;

    const CONFIG = {
      count: 60,
      maxSize: 1.8,
      minSize: 0.4,
      speed: 0.15,
      connectionDistance: 140,
      color: { r: 167, g: 139, b: 250 }, // accent violet
      opacity: 0.25,
      lineOpacity: 0.06,
    };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        size: Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize,
        opacity: Math.random() * CONFIG.opacity + 0.05,
      };
    }

    function init() {
      resize();
      particles = [];

      // Reduce particles on mobile
      const count = width < 640 ? Math.floor(CONFIG.count * 0.4) : CONFIG.count;
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const { r, g, b } = CONFIG.color;

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.connectionDistance) {
            const alpha = (1 - dist / CONFIG.connectionDistance) * CONFIG.lineOpacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx.fill();
      }
    }

    function update() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }
    }

    function loop() {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    }

    // Handle resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(animationId);
        init();
        loop();
      }, 200);
    });

    init();
    loop();
  }

  /* =============================================
     3. BUTTON MAGNETIC EFFECT (subtle)
     ============================================= */
  function initMagneticButton() {
    const btn = document.getElementById('cta-button');
    if (!btn) return;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translateY(-2px) scale(1.04) translate(${x * 0.08}px, ${y * 0.08}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  }

  /* =============================================
     INIT
     ============================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initParticles();
    initMagneticButton();
  });
})();
