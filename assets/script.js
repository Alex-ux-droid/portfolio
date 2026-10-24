(() => {
  const root = document.documentElement;
  const KEY = 'theme';

  // Theme: respect saved choice, else system.
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (_) {}

  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const current = root.getAttribute('data-theme') || (systemDark ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (_) {}
    });
  }

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Reveal on scroll
  const items = document.querySelectorAll('.section, .hero-facts li, .card, .case-block, .contact-link');
  if ('IntersectionObserver' in window) {
    items.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }
})();
