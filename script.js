// Minimal interactivity and ambient motion
(() => {
  const d = document;

  // Dynamic year
  const y = d.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Smooth scroll for internal links
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const el = id && id !== '#' ? d.querySelector(id) : null;
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Reveal-on-scroll using IntersectionObserver
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.classList.add('in');
    }
  }, { threshold: 0.15 });
  d.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Starfield canvas (lightweight)
  const canvas = d.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, stars;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    // Create stars proportional to area but capped
    const count = Math.min(220, Math.floor((w * h) / 18000));
    stars = new Array(count).fill(0).map(() => ({
      x: rand(0, w),
      y: rand(0, h),
      z: rand(0.2, 1), // depth factor for parallax speed/brightness
      r: rand(0.3, 1.2)
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const alpha = 0.3 + 0.7 * s.z;
      ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Slow drift upward-right
      s.x += 0.02 + 0.04 * s.z;
      s.y -= 0.01 + 0.03 * s.z;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();

  // Handle LinkedIn badge loading
  const badge = d.querySelector('.badge-base');
  if (badge) {
    setTimeout(() => {
      if (!badge.querySelector('iframe, img')) {
        badge.style.display = 'none';
        // Remove top margin from location when badge is hidden
        const location = badge.nextElementSibling;
        if (location && location.classList.contains('location')) {
          location.style.marginTop = '0';
        }
      }
    }, 5000); // Wait 5 seconds for the script to load and render the badge
  }
})();
