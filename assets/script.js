(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} },
  };

  /* ---------- Theme ---------- */
  const saved = store.get('theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  const isDark = () => (root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const next = isDark() ? 'light' : 'dark';
      const apply = () => { root.setAttribute('data-theme', next); store.set('theme', next); };
      if (!document.startViewTransition || reduce) { apply(); return; }
      const r0 = toggle.getBoundingClientRect();
      const x = e.clientX || r0.left + 18, y = e.clientY || r0.top + 18;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(apply);
      vt.ready.then(() => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }));
    });
  }

  /* ---------- i18n ---------- */
  const dict = window.I18N || {};
  const nodes = [...document.querySelectorAll('[data-i18n]')];
  const metaNodes = [...document.querySelectorAll('[data-i18n-content]')];
  const ukCache = new Map();
  nodes.forEach((el) => ukCache.set(el, el.innerHTML));
  metaNodes.forEach((el) => ukCache.set(el, el.getAttribute('content')));
  let splitHero = null; // set later
  const setLang = (lang) => {
    const d = lang === 'uk' ? null : dict[lang];
    if (lang !== 'uk' && !d) return;
    nodes.forEach((el) => {
      const key = el.dataset.i18n;
      if (!d) el.innerHTML = ukCache.get(el);
      else if (d[key] != null) el.innerHTML = d[key];
    });
    metaNodes.forEach((el) => {
      const key = el.dataset.i18nContent;
      el.setAttribute('content', d && d[key] != null ? d[key] : ukCache.get(el));
    });
    root.setAttribute('lang', lang);
    document.querySelectorAll('.lang-toggle span').forEach((s) => s.classList.toggle('on', s.dataset.lang === lang));
    store.set('lang', lang);
    if (splitHero) splitHero();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
  const urlLang = new URLSearchParams(location.search).get('lang');
  const startLang = (urlLang === 'en' || urlLang === 'uk') ? urlLang : (store.get('lang') || (navigator.language && !/^uk|^ru/i.test(navigator.language) ? 'en' : 'uk'));
  const langBtn = document.querySelector('.lang-toggle');
  if (langBtn) langBtn.addEventListener('click', () => setLang(root.getAttribute('lang') === 'uk' ? 'en' : 'uk'));

  /* ---------- Cookie consent ---------- */
  const cookie = document.querySelector('.cookie');
  if (cookie) {
    const consent = store.get('consent');
    if (!consent) setTimeout(() => (cookie.hidden = false), 1200);
    cookie.querySelectorAll('[data-ck]').forEach((b) => b.addEventListener('click', () => {
      store.set('consent', b.dataset.ck);
      cookie.hidden = true;
      if (b.dataset.ck === 'accept') window.dispatchEvent(new CustomEvent('consent:accepted'));
    }));
  }
  // Підключення аналітики після згоди: window.addEventListener('consent:accepted', () => { ... });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Header, nav, progress ---------- */
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
    ind.style.left = (r.left - nr.left + nav.scrollLeft) + 'px'; ind.style.width = r.width + 'px'; ind.classList.add('on');
  };
  let activeLink = null, ticking = false;
  const onScroll = () => {
    const sy = window.scrollY;
    if (header) header.classList.toggle('scrolled', sy > 24);
    if (progress) { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleX(${max > 0 ? sy / max : 0})`; }
    let cur = null;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * .4) cur = navLinks[i]; });
    if (cur !== activeLink) { activeLink = cur; moveInd(cur); }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', () => moveInd(activeLink));
  navLinks.forEach((a) => a.addEventListener('mouseenter', () => moveInd(a)));
  if (nav) nav.addEventListener('mouseleave', () => moveInd(activeLink));
  onScroll();

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const inner = el.querySelector('span'); const k = 0.3;
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
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.toggle('on', c === chip));
    const f = chip.dataset.filter;
    const show = works.filter((w) => f === 'all' || w.dataset.cat === f);
    works.forEach((w) => w.classList.toggle('hide', !show.includes(w)));
    if (window.gsap && !reduce) gsap.fromTo(show, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, stagger: .03, ease: 'power3.out', overwrite: true, clearProps: 'transform' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  /* ---------- Hero words ---------- */
  const h1 = document.querySelector('[data-words]');
  let heroPlayed = false;
  splitHero = () => {
    if (!h1 || reduce) return;
    const words = h1.textContent.trim().split(' ');
    h1.innerHTML = words.map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(' ');
    if (heroPlayed && window.gsap) gsap.from('[data-words] .wi', { yPercent: 110, duration: .9, stagger: .04, ease: 'power4.out' });
  };
  setLang(startLang);

  /* ---------- GSAP ---------- */
  if (!window.gsap || reduce) {
    document.querySelectorAll('.skill-bar i').forEach((b) => (b.style.transform = 'none'));
    document.querySelectorAll('[data-count]').forEach((c) => (c.textContent = c.dataset.count));
    document.querySelectorAll('.section-head').forEach((s) => s.classList.add('in'));
    const pic = document.querySelector('[data-photo] picture'); if (pic) pic.style.clipPath = 'none';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  const intro = gsap.timeline({ defaults: { ease }, onComplete: () => (heroPlayed = true) });
  intro
    .from('.site-header', { y: -20, autoAlpha: 0, duration: .8 }, 0)
    .from('.hero .eyebrow', { y: 20, autoAlpha: 0, duration: .7 }, .15)
    .from('[data-words] .wi', { yPercent: 110, duration: 1.1, stagger: .05, ease: 'power4.out' }, .25)
    .to('[data-photo] picture', { clipPath: 'inset(0 0 0 0%)', duration: 1.4, ease: 'power4.inOut' }, .3)
    .from('[data-photo] img', { scale: 1.12, duration: 1.8, ease: 'power3.out' }, .3)
    .from('.hero .lead', { y: 24, autoAlpha: 0, duration: .9 }, .8)
    .from('.hero .cta-row', { y: 24, autoAlpha: 0, duration: .9 }, .95)
    .from('.hero-facts', { y: 24, autoAlpha: 0, duration: .9 }, 1.05)
    .from('.hero-facts li', { y: 14, autoAlpha: 0, duration: .7, stagger: .08 }, 1.15)
    .from('.marquee', { autoAlpha: 0, duration: 1 }, 1.4);

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = +el.dataset.count; const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.6, ease: 'power2.out', delay: 1.25, onUpdate: () => (el.textContent = Math.round(obj.v)) });
  });

  document.querySelectorAll('.section-head').forEach((head) => {
    gsap.from(head.children, { scrollTrigger: { trigger: head, start: 'top 85%', once: true, onEnter: () => head.classList.add('in') }, y: 24, autoAlpha: 0, duration: .9, stagger: .1, ease });
  });

  const groups = [
    ['.manifesto li', .07], ['.about-strip > *', .12],
    ['.grid.cards .card', .08], ['.skills li', .05], ['.sub-head', 0],
    ['.works-filter', 0], ['.work', .03], ['.works-note', 0],
    ['.case-intro', 0], ['.case-block', .07],
    ['.now-list li', .07],
    ['.contact-lead', 0], ['.contact-link', .08],
  ];
  groups.forEach(([sel, stagger]) => {
    const els = gsap.utils.toArray(sel);
    if (!els.length) return;
    gsap.set(els, { autoAlpha: 0, y: 20 });
    ScrollTrigger.batch(els, { start: 'top 92%', once: true, onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: .7, stagger, ease, overwrite: true, clearProps: 'transform' }) });
  });

  gsap.utils.toArray('.skill-bar i').forEach((bar, i) => {
    gsap.to(bar, { scaleX: 1, duration: 1.1, ease: 'power3.out', delay: i * .05, scrollTrigger: { trigger: bar, start: 'top 92%', once: true } });
  });

  if (finePointer) {
    document.querySelectorAll('.card, .contact-link').forEach((el) => {
      el.addEventListener('pointerenter', () => gsap.to(el, { y: -3, duration: .3, ease, overwrite: 'auto' }));
      el.addEventListener('pointerleave', () => gsap.to(el, { y: 0, duration: .4, ease, overwrite: 'auto' }));
    });
  }

  gsap.to('[data-photo] img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
