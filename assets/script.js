(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const KEY = 'theme';

  /* ---------- Theme ---------- */
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (_) {}
  const isDark = () => (root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const next = isDark() ? 'light' : 'dark';
      const apply = () => { root.setAttribute('data-theme', next); try { localStorage.setItem(KEY, next); } catch (_) {} };
      if (!document.startViewTransition || reduce) { apply(); return; }
      const r0 = toggle.getBoundingClientRect();
      const x = e.clientX || r0.left + 18, y = e.clientY || r0.top + 18;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(apply);
      vt.ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' });
      });
    });
  }

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Cursor spotlight ---------- */
  if (finePointer && !reduce) {
    let tx = innerWidth / 2, ty = innerHeight * .3, cx = tx, cy = ty, raf = null;
    const tick = () => {
      cx += (tx - cx) * .12; cy += (ty - cy) * .12;
      root.style.setProperty('--mx', cx + 'px'); root.style.setProperty('--my', cy + 'px');
      if (Math.abs(tx - cx) > .5 || Math.abs(ty - cy) > .5) raf = requestAnimationFrame(tick); else raf = null;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY; document.body.classList.add('has-pointer');
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const el = id === '#top' ? document.body : document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: id === '#top' ? 0 : -72, duration: 1.1 });
        history.replaceState(null, '', id);
      });
    });
  }

  /* ---------- Header, nav indicator, progress ---------- */
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.progress');
  const nav = document.querySelector('.site-nav');
  const ind = document.querySelector('.nav-ind');
  const navLinks = nav ? [...nav.querySelectorAll('a')] : [];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const moveInd = (a) => {
    if (!ind) return;
    if (!a) { ind.classList.remove('on'); return; }
    const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    ind.style.left = (r.left - nr.left + nav.scrollLeft) + 'px';
    ind.style.width = r.width + 'px';
    ind.classList.add('on');
  };
  let activeLink = null;
  const onScroll = () => {
    const sy = window.scrollY;
    if (header) header.classList.toggle('scrolled', sy > 24);
    if (progress) { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleX(${max > 0 ? sy / max : 0})`; }
    let cur = null;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * .4) cur = navLinks[i]; });
    if (cur !== activeLink) { activeLink = cur; moveInd(cur); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => moveInd(activeLink));
  navLinks.forEach((a) => a.addEventListener('mouseenter', () => moveInd(a)));
  if (nav) nav.addEventListener('mouseleave', () => moveInd(activeLink));
  onScroll();

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const inner = el.querySelector('span'); const k = 0.35;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
        if (inner) inner.style.transform = `translate(${dx * k * .4}px, ${dy * k * .4}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'; el.style.transform = '';
        if (inner) { inner.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'; inner.style.transform = ''; }
        setTimeout(() => { el.style.transition = ''; if (inner) inner.style.transition = ''; }, 500);
      });
    });
  }

  /* ---------- Works filter ---------- */
  const chips = document.querySelectorAll('.chip[data-filter]');
  const works = [...document.querySelectorAll('.work')];
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.toggle('on', c === chip));
      const f = chip.dataset.filter;
      const show = works.filter((w) => f === 'all' || w.dataset.cat === f);
      works.forEach((w) => w.classList.toggle('hide', !show.includes(w)));
      if (window.gsap && !reduce) {
        gsap.fromTo(show, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, stagger: .03, ease: 'power3.out', overwrite: true, clearProps: 'transform' });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* ---------- Split hero words ---------- */
  const h1 = document.querySelector('[data-words]');
  if (h1 && !reduce) {
    const words = h1.textContent.trim().split(' ');
    h1.innerHTML = words.map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(' ');
  }

  /* ---------- GSAP choreography ---------- */
  if (!window.gsap || reduce) {
    document.querySelectorAll('.skill-bar i').forEach((b) => (b.style.transform = 'none'));
    document.querySelectorAll('[data-count]').forEach((c) => (c.textContent = c.dataset.count));
    document.querySelectorAll('.section-head').forEach((s) => s.classList.add('in'));
    const pic = document.querySelector('[data-photo] picture'); if (pic) pic.style.clipPath = 'none';
    const cap = document.querySelector('[data-photo] figcaption'); if (cap) cap.style.opacity = '';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (lenis) lenis.on('scroll', ScrollTrigger.update);
  const ease = 'power3.out';

  // Hero intro
  const intro = gsap.timeline({ defaults: { ease } });
  intro
    .from('.site-header', { y: -20, autoAlpha: 0, duration: .8 }, 0)
    .from('.hero .eyebrow', { y: 20, autoAlpha: 0, duration: .7 }, .15)
    .from('[data-words] .wi', { yPercent: 110, duration: 1.1, stagger: .05, ease: 'power4.out' }, .25)
    .to('[data-photo] picture', { clipPath: 'inset(0 0 0% 0 round 22px)', duration: 1.3, ease: 'power4.inOut' }, .35)
    .from('[data-photo] img', { scale: 1.18, duration: 1.6, ease: 'power3.out' }, .35)
    .from('.hero .lead', { y: 24, autoAlpha: 0, duration: .9 }, .8)
    .from('.hero .cta-row', { y: 24, autoAlpha: 0, duration: .9 }, .95)
    .to('[data-photo] figcaption', { opacity: .85, duration: .8 }, 1.3)
    .from('.hero-facts', { y: 24, autoAlpha: 0, duration: .9 }, 1.05)
    .from('.hero-facts li', { y: 14, autoAlpha: 0, duration: .7, stagger: .08 }, 1.15)
    .from('.marquee', { autoAlpha: 0, duration: 1 }, 1.4);

  // Counters
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = +el.dataset.count; const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.6, ease: 'power2.out', delay: 1.25, onUpdate: () => (el.textContent = Math.round(obj.v)) });
  });

  // Section heads
  document.querySelectorAll('.section-head').forEach((head) => {
    gsap.from(head.children, {
      scrollTrigger: { trigger: head, start: 'top 85%', once: true, onEnter: () => head.classList.add('in') },
      y: 28, autoAlpha: 0, duration: .9, stagger: .1, ease,
    });
  });

  // Rise-ins
  const groups = [
    ['.manifesto li', .08], ['.about-strip > *', .12],
    ['.grid.cards .card', .1], ['.skills li', .05], ['.sub-head', 0],
    ['.works-filter', 0], ['.work', .035], ['.works-note', 0],
    ['.case-intro', 0], ['.case-block', .08],
    ['.now-list li', .08],
    ['.contact-lead', 0], ['.contact-link', .1],
  ];
  groups.forEach(([sel, stagger]) => {
    const els = gsap.utils.toArray(sel);
    if (!els.length) return;
    gsap.set(els, { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(els, {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: .8, stagger, ease, overwrite: true, clearProps: 'transform' }),
    });
  });

  // Skill bars
  gsap.utils.toArray('.skill-bar i').forEach((bar, i) => {
    gsap.to(bar, { scaleX: 1, duration: 1.2, ease: 'power3.out', delay: i * .05, scrollTrigger: { trigger: bar, start: 'top 90%', once: true } });
  });

  // Hover lift
  if (finePointer) {
    document.querySelectorAll('.card, .contact-link').forEach((el) => {
      el.addEventListener('pointerenter', () => gsap.to(el, { y: -4, duration: .35, ease, overwrite: 'auto' }));
      el.addEventListener('pointerleave', () => gsap.to(el, { y: 0, duration: .45, ease, overwrite: 'auto' }));
    });
  }

  // Photo parallax + tilt
  const photo = document.querySelector('[data-photo]');
  if (photo) {
    gsap.to('[data-photo] img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (finePointer) {
      photo.addEventListener('pointermove', (e) => {
        const r = photo.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
        gsap.to(photo, { rotateY: dx * 6, rotateX: -dy * 6, transformPerspective: 1200, duration: .6, ease: 'power2.out' });
      });
      photo.addEventListener('pointerleave', () => gsap.to(photo, { rotateY: 0, rotateX: 0, duration: .9, ease: 'power3.out' }));
    }
  }

  // Hero text parallax
  gsap.to('.hero-text', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
