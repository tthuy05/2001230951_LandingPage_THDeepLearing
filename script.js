/**
 * Landing Page — Night Sky Background
 * Multi-layered: gradient sky + stars + milky way + shooting stars
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
     2. NIGHT SKY — CANVAS ENGINE
     ============================================= */
  function initNightSky() {
    const canvas = document.getElementById('sky-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    let stars = [];
    let shootingStars = [];
    let nebulaOffset = 0;
    let frameCount = 0;

    // ---- Config ----
    const STAR_COUNT_BASE = 350;
    const SHOOTING_STAR_INTERVAL = [3000, 7000]; // ms range
    const NEBULA_SPEED = 0.00008;

    // ---- Resize ----
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    // ---- Stars ----
    function createStars() {
      stars = [];
      const count = W < 640 ? Math.floor(STAR_COUNT_BASE * 0.5) : STAR_COUNT_BASE;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          radius: Math.random() * 1.6 + 0.3,
          baseOpacity: Math.random() * 0.6 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          // Color temperature — warm white to blue-white
          temp: Math.random(),
        });
      }
    }

    function getStarColor(temp, opacity) {
      // Warm → cool star colors
      if (temp < 0.3) return `rgba(255, 244, 230, ${opacity})`; // warm white
      if (temp < 0.6) return `rgba(230, 236, 255, ${opacity})`; // white-blue
      if (temp < 0.85) return `rgba(200, 220, 255, ${opacity})`; // light blue
      return `rgba(180, 200, 255, ${opacity})`; // blue
    }

    function drawStars(time) {
      for (const s of stars) {
        // Twinkle: oscillate opacity and size
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
        const opacity = s.baseOpacity + twinkle * 0.25;
        const r = s.radius + twinkle * 0.3;

        if (opacity <= 0.05) continue;

        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(r, 0.2), 0, Math.PI * 2);
        ctx.fillStyle = getStarColor(s.temp, Math.max(opacity, 0));
        ctx.fill();

        // Glow for brighter stars
        if (s.radius > 1.0 && opacity > 0.5) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
          g.addColorStop(0, getStarColor(s.temp, opacity * 0.2));
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.fill();
        }
      }
    }

    // ---- Milky Way / Nebula ----
    function drawNebula(time) {
      nebulaOffset = time * NEBULA_SPEED;

      // Main milky way band — diagonal across screen
      const cx = W * 0.5;
      const cy = H * 0.45;
      const rx = W * 0.7;
      const ry = H * 0.18;
      const angle = -0.4 + Math.sin(nebulaOffset) * 0.05;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Layer 1: Wide diffuse glow
      const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g1.addColorStop(0, 'rgba(120, 100, 200, 0.06)');
      g1.addColorStop(0.3, 'rgba(80, 70, 160, 0.04)');
      g1.addColorStop(0.6, 'rgba(50, 50, 130, 0.02)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry * 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Core brightness
      const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.5);
      g2.addColorStop(0, 'rgba(160, 140, 240, 0.07)');
      g2.addColorStop(0.4, 'rgba(130, 110, 200, 0.04)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 0.5, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Layer 3: Bright center core
      const g3 = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.2);
      g3.addColorStop(0, 'rgba(200, 180, 255, 0.08)');
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 0.2, ry * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Secondary nebula cloud (offset)
      ctx.save();
      ctx.translate(W * 0.75, H * 0.3);
      ctx.rotate(0.3);
      const g4 = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.15);
      g4.addColorStop(0, 'rgba(100, 80, 180, 0.05)');
      g4.addColorStop(1, 'transparent');
      ctx.fillStyle = g4;
      ctx.beginPath();
      ctx.ellipse(0, 0, W * 0.15, H * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---- Shooting Stars ----
    function spawnShootingStar() {
      // Random start position along top/right edge
      const side = Math.random();
      let sx, sy;
      if (side < 0.6) {
        // From top
        sx = Math.random() * W * 0.8 + W * 0.1;
        sy = -10;
      } else {
        // From right
        sx = W + 10;
        sy = Math.random() * H * 0.4;
      }

      // Direction: roughly top-right to bottom-left
      const angle = Math.PI * (0.55 + Math.random() * 0.3);
      const speed = 6 + Math.random() * 8;

      shootingStars.push({
        x: sx,
        y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.008 + Math.random() * 0.012,
        length: 60 + Math.random() * 100,
        width: 1.2 + Math.random() * 1.2,
        brightness: 0.7 + Math.random() * 0.3,
      });
    }

    function updateAndDrawShootingStars() {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];

        // Update
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= ss.decay;

        if (ss.life <= 0 || ss.x < -200 || ss.x > W + 200 || ss.y > H + 200) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Draw trail
        const tailX = ss.x - (ss.vx / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length;
        const tailY = ss.y - (ss.vy / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        const alpha = ss.life * ss.brightness;
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.15, `rgba(200, 210, 255, ${alpha * 0.6})`);
        grad.addColorStop(0.5, `rgba(160, 170, 250, ${alpha * 0.2})`);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.width * ss.life;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2 * ss.life, 0, Math.PI * 2);
        const headGlow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 4 * ss.life);
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        headGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = headGlow;
        ctx.fill();
      }
    }

    // ---- Shooting star scheduler ----
    function scheduleShootingStar() {
      const delay = SHOOTING_STAR_INTERVAL[0] +
        Math.random() * (SHOOTING_STAR_INTERVAL[1] - SHOOTING_STAR_INTERVAL[0]);
      setTimeout(() => {
        spawnShootingStar();
        // Sometimes spawn a double
        if (Math.random() < 0.15) {
          setTimeout(spawnShootingStar, 200 + Math.random() * 400);
        }
        scheduleShootingStar();
      }, delay);
    }

    // ---- Background gradient (slowly shifting) ----
    function drawSkyGradient(time) {
      const shift = Math.sin(time * 0.00003) * 0.5 + 0.5; // 0..1 very slow

      const g = ctx.createLinearGradient(0, 0, W * 0.3, H);

      // Deep blue → midnight purple, with slow shift
      const r1 = Math.floor(5 + shift * 8);
      const g1 = Math.floor(5 + shift * 5);
      const b1 = Math.floor(18 + shift * 12);

      const r2 = Math.floor(12 + shift * 10);
      const g2 = Math.floor(8 + shift * 6);
      const b2 = Math.floor(30 + shift * 15);

      const r3 = Math.floor(8 + (1 - shift) * 6);
      const g3 = Math.floor(6 + (1 - shift) * 4);
      const b3 = Math.floor(22 + (1 - shift) * 10);

      g.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
      g.addColorStop(0.5, `rgb(${r2}, ${g2}, ${b2})`);
      g.addColorStop(1, `rgb(${r3}, ${g3}, ${b3})`);

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // ---- Horizon glow ----
    function drawHorizonGlow(time) {
      const pulse = Math.sin(time * 0.0001) * 0.5 + 0.5;
      const g = ctx.createRadialGradient(
        W * 0.5, H * 1.1, 0,
        W * 0.5, H * 1.1, H * 0.7
      );
      g.addColorStop(0, `rgba(60, 40, 120, ${0.12 + pulse * 0.04})`);
      g.addColorStop(0.4, `rgba(30, 20, 80, ${0.06 + pulse * 0.02})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // ---- Main loop ----
    function render(time) {
      drawSkyGradient(time);
      drawHorizonGlow(time);
      drawNebula(time);
      drawStars(time);
      updateAndDrawShootingStars();
      frameCount++;
      requestAnimationFrame(render);
    }

    // ---- Init ----
    function init() {
      resize();
      createStars();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createStars();
      }, 200);
    });

    init();
    scheduleShootingStar();
    // Initial shooting star after short delay for wow effect
    setTimeout(spawnShootingStar, 1500);
    requestAnimationFrame(render);
  }

  /* =============================================
     3. CSS STAR LAYERS (fallback + extra depth)
     ============================================= */
  function initCSSStars() {
    const container = document.getElementById('css-stars');
    if (!container) return;

    // Three layers of CSS stars for depth parallax
    const layers = [
      { count: 50, className: 'star-layer-1' },
      { count: 30, className: 'star-layer-2' },
      { count: 15, className: 'star-layer-3' },
    ];

    layers.forEach(({ count, className }) => {
      const layer = document.createElement('div');
      layer.className = `star-layer ${className}`;

      let shadows = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.4 + 0.1;
        shadows.push(`${x}vw ${y}vh 0 ${size}px rgba(200, 210, 255, ${opacity})`);
      }

      layer.style.boxShadow = shadows.join(', ');
      container.appendChild(layer);
    });
  }

  /* =============================================
     4. BUTTON MAGNETIC EFFECT
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
    initNightSky();
    initCSSStars();
    initMagneticButton();
  });
})();
