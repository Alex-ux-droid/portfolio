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

  /* ---------- i18n ---------- */
  const dict = window.I18N || {};
  const nodes = [...document.querySelectorAll('[data-i18n]')];
  const metaNodes = [...document.querySelectorAll('[data-i18n-content]')];
  const ukCache = new Map();
  nodes.forEach((el) => ukCache.set(el, el.innerHTML));
  metaNodes.forEach((el) => ukCache.set(el, el.getAttribute('content')));
  let splitHero = null; // set later

  /* ---------- Marquee: безшовна петля на будь-якій ширині ---------- */
  const track = document.querySelector('.marquee-track');
  let marqueeSet = track ? track.innerHTML : '';
  const buildMarquee = () => {
    if (!track) return;
    track.style.animation = 'none';
    track.innerHTML = marqueeSet;
    const setWidth = track.scrollWidth + 30; // + gap
    let copies = 1;
    while (copies * setWidth < innerWidth * 2 + setWidth && copies < 16) { track.insertAdjacentHTML('beforeend', marqueeSet); copies++; }
    track.style.setProperty('--shift', `-${(100 / copies).toFixed(4)}%`);
    track.style.setProperty('--dur', `${Math.max(12, Math.round(setWidth / 60))}s`); // ~60px/s
    void track.offsetWidth; track.style.animation = '';
  };
  let mqTimer; window.addEventListener('resize', () => { clearTimeout(mqTimer); mqTimer = setTimeout(buildMarquee, 200); });
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
    if (track) { marqueeSet = (d && d['marquee'] != null) ? d['marquee'] : ukCache.get(track); buildMarquee(); }
    if (splitHero) splitHero();
    document.dispatchEvent(new CustomEvent('lang:change'));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
  const urlLang = new URLSearchParams(location.search).get('lang');
  const startLang = (urlLang === 'en' || urlLang === 'uk') ? urlLang : (store.get('lang') || (navigator.language && !/^uk|^ru/i.test(navigator.language) ? 'en' : 'uk'));
  const langBtn = document.querySelector('.lang-toggle');
  const flip = () => setLang(root.getAttribute('lang') === 'uk' ? 'en' : 'uk');
  if (langBtn) langBtn.addEventListener('click', flip);
  document.querySelectorAll('[data-lang-switch]').forEach((b) => b.addEventListener('click', flip));

  /* ---------- Cookie consent ---------- */
  const cookie = document.querySelector('.cookie');
  if (cookie) {
    const inner = cookie.querySelector('.cookie-inner');
    const icon = cookie.querySelector('.cookie-icon');
    const parts = [cookie.querySelector('.cookie-head'), cookie.querySelector('.cookie-inner > p'), cookie.querySelector('.cookie-actions')];
    let shown = false;
    const show = () => {
      if (shown || store.get('consent')) return;
      shown = true; cookie.hidden = false;
      if (!window.gsap || reduce) { inner.style.opacity = 1; parts.forEach((p) => (p.style.opacity = 1)); return; }
      const tl = gsap.timeline();
      tl.fromTo(inner, { y: 90, scale: .86, rotate: -6, autoAlpha: 0 }, { y: 0, scale: 1, rotate: 0, autoAlpha: 1, duration: .9, ease: 'back.out(1.6)' })
        .fromTo(icon, { x: -60, rotate: -540 }, { x: 0, rotate: 0, duration: 1.1, ease: 'power3.out' }, .1)
        .to(parts, { autoAlpha: 1, y: 0, duration: .5, stagger: .1, ease: 'power2.out' }, .35)
        .fromTo(parts, { y: 10 }, { y: 0, duration: .5, stagger: .1 }, .35)
        .to(icon, { rotate: 10, yoyo: true, repeat: 3, duration: .18, ease: 'sine.inOut' }, 1.2);
    };
    // Не одразу: через 8 с або коли прочитано чверть сторінки.
    const timer = setTimeout(show, 8000);
    const onScrollShow = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max > 0 && window.scrollY / max > .25) { clearTimeout(timer); show(); window.removeEventListener('scroll', onScrollShow); }
    };
    if (!store.get('consent')) window.addEventListener('scroll', onScrollShow, { passive: true });
    cookie.querySelectorAll('[data-ck]').forEach((b) => b.addEventListener('click', () => {
      store.set('consent', b.dataset.ck);
      const done = () => { cookie.hidden = true; };
      if (window.gsap && !reduce) {
        gsap.timeline({ onComplete: done })
          .to(icon, { rotate: 360, scale: 1.3, duration: .4, ease: 'power2.out' })
          .to(inner, { y: 40, scale: .9, autoAlpha: 0, duration: .45, ease: 'power3.in' }, .15);
      } else done();
      if (b.dataset.ck === 'accept') window.dispatchEvent(new CustomEvent('consent:accepted'));
    }));
  }
  // Підключення аналітики після згоди: window.addEventListener('consent:accepted', () => { ... });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Header, nav, progress ---------- */
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.progress');
  const toTop = document.querySelector('[data-to-top]');
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  const nav = document.querySelector('.site-nav');
  const ind = document.querySelector('.nav-ind');
  const navLinks = nav ? [...nav.querySelectorAll('a')] : [];
  const sections = navLinks.map((a) => { const h = a.getAttribute('href'); return h && h.startsWith('#') ? document.querySelector(h) : null; }).filter(Boolean);
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
    if (toTop) { const max = document.documentElement.scrollHeight - innerHeight; toTop.style.setProperty('--p', (max > 0 ? sy / max : 0).toFixed(3)); toTop.classList.toggle('on', sy > innerHeight * .6); }
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

  /* ---------- Кнопки: світло йде за курсором, один прохід «сканера» при наведенні ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.classList.add('btn-light');
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--bx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
        el.style.setProperty('--by', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerenter', () => { el.classList.remove('scan'); void el.offsetWidth; el.classList.add('scan'); });
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

  /* ---------- Lightbox ---------- */
  const lb = document.querySelector('.lightbox');
  if (lb) {
    const lbImg = lb.querySelector('img');
    document.querySelectorAll('[data-lightbox]').forEach((el) => el.addEventListener('click', () => { lbImg.src = el.dataset.lightbox; lb.hidden = false; document.body.style.overflow = 'hidden'; }));
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
    lb.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) close(); });
  }

  /* ---------- Hero: сітка-горизонт реагує на курсор ---------- */
  const heroTilt = document.querySelector('[data-hero-tilt]');
  if (heroTilt && finePointer && !reduce) {
    const hz = heroTilt.querySelector('.hero-horizon'), plane = heroTilt.querySelector('.hz-plane');
    heroTilt.addEventListener('pointermove', (e) => {
      const r = heroTilt.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      if (hz) hz.style.perspectiveOrigin = `${50 + x * 30}% ${y * 20}%`;
      if (plane) plane.style.transform = `rotateX(${68 - y * 4}deg) translateX(${x * -40}px)`;
    });
    heroTilt.addEventListener('pointerleave', () => { if (hz) hz.style.perspectiveOrigin = ''; if (plane) plane.style.transform = ''; });
  }

  /* ---------- CTA: світло йде за курсором ---------- */
  document.querySelectorAll('[data-cta]').forEach((cta) => {
    if (!finePointer) return;
    cta.addEventListener('pointermove', (e) => { const r = cta.getBoundingClientRect(); cta.style.setProperty('--mx', `${e.clientX - r.left}px`); cta.style.setProperty('--my', `${e.clientY - r.top}px`); });
  });

  /* ---------- Копіювання пошти ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      try { await navigator.clipboard.writeText(btn.dataset.copy); } catch (_) { return; }
      const d = dict[root.getAttribute('lang')];
      btn.textContent = (d && d['contact.copied']) || 'Скопійовано'; btn.classList.add('ok');
      setTimeout(() => { btn.textContent = (d && d['contact.copy']) || label; btn.classList.remove('ok'); }, 1600);
    });
  });

  /* ---------- Contact modal ---------- */
  const modal = document.getElementById('contact-modal');
  if (modal) {
    const panel = modal.querySelector('.modal-panel');
    const form = modal.querySelector('[data-contact-form]');
    const status = modal.querySelector('.modal-status');
    const tr = (k, uk) => { const d = dict[root.getAttribute('lang')]; return (d && d[k]) || uk; };
    let lastFocus = null;
    const openModal = () => {
      lastFocus = document.activeElement;
      modal.hidden = false; document.body.style.overflow = 'hidden';
      if (window.gsap && !reduce) {
        gsap.fromTo(modal.querySelector('.modal-backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 });
        gsap.fromTo(panel, { y: 28, scale: .97, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: .55, ease: 'power3.out', clearProps: 'transform' });
      }
      setTimeout(() => { const f = form.querySelector('input'); f && f.focus(); }, 60);
    };
    const closeModal = () => {
      const done = () => { modal.hidden = true; document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); };
      if (window.gsap && !reduce) gsap.to(panel, { y: 16, autoAlpha: 0, duration: .25, ease: 'power2.in', onComplete: () => { gsap.set(panel, { clearProps: 'all' }); done(); } });
      else done();
    };
    document.querySelectorAll('[data-open-contact]').forEach((b) => b.addEventListener('click', openModal));
    modal.querySelectorAll('[data-close-contact]').forEach((b) => b.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim(), contact = (fd.get('contact') || '').toString().trim(), message = (fd.get('message') || '').toString().trim();
      if (!name || !contact || !message) { status.textContent = tr('cm.fill', 'Заповніть усі три поля.'); return; }
      const endpoint = form.dataset.endpoint;
      const btn = form.querySelector('[type="submit"]');
      if (endpoint) {
        btn.disabled = true;
        try {
          const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name, contact, message, page: location.href, lang: root.getAttribute('lang') }) });
          if (!r.ok) throw new Error(r.status);
          status.textContent = tr('cm.ok', 'Надіслано. Відповім протягом дня.'); form.reset();
          document.dispatchEvent(new CustomEvent('contact:sent'));
        } catch (_) { status.textContent = tr('cm.err', 'Не вдалося надіслати. Напишіть на casperlavkor@gmail.com або в Telegram.'); }
        btn.disabled = false;
      } else {
        const subject = encodeURIComponent(`Запит з сайту: ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name}\nКонтакт: ${contact}`);
        location.href = `mailto:casperlavkor@gmail.com?subject=${subject}&body=${body}`;
        status.textContent = tr('cm.mail', 'Відкриваю вашу пошту з готовим листом. Якщо нічого не сталося, напишіть на casperlavkor@gmail.com або в Telegram.');
      }
    });
  }

  /* ---------- Лабораторія: чат помічника друкує сам ---------- */
  const chatLog = document.querySelector('[data-chat] .chat-log');
  if (chatLog) {
    const scriptUk = [
      ['u', 'Клієнт з минулого тижня, той що питав про три апарати. Що з ним?'],
      ['a', 'Петренко, запит 14.10. Чекав КП до п\'ятниці, я підготував його за твоїм шаблоном. Надіслати?'],
      ['u', 'Так. І постав нагадування на вівторок.'],
      ['a', 'Надіслав. Нагадування у вівторок о 10:00. Ще два клієнти без відповіді понад 3 дні, показати?'],
    ];
    const scriptEn = [
      ['u', 'The client from last week, the one asking about three devices. Where are we?'],
      ['a', 'Petrenko, enquiry of 14 Oct. He expected a proposal by Friday, I drafted it from your template. Send it?'],
      ['u', 'Yes. And set a reminder for Tuesday.'],
      ['a', 'Sent. Reminder Tuesday 10:00. Two more clients unanswered for over 3 days, show them?'],
    ];
    let running = false, stop = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      if (running) return; running = true;
      while (!stop) {
        chatLog.innerHTML = '';
        const lines = root.getAttribute('lang') === 'en' ? scriptEn : scriptUk;
        for (const [who, text] of lines) {
          if (stop) break;
          const m = document.createElement('div'); m.className = 'msg ' + who;
          const cur = document.createElement('i'); cur.className = 'cur';
          chatLog.appendChild(m); m.appendChild(cur);
          await sleep(who === 'a' ? 500 : 250);
          for (let i = 0; i < text.length; i++) {
            if (stop) break;
            m.insertBefore(document.createTextNode(text[i]), cur);
            await sleep(reduce ? 0 : (who === 'a' ? 18 : 28));
          }
          cur.remove();
          await sleep(900);
        }
        await sleep(3500);
      }
      running = false;
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { stop = false; run(); } else { stop = true; } }), { threshold: .3 }).observe(chatLog);
    } else run();
  }

  /* ---------- Лабораторія: журнал і архів з assets/lab.js ---------- */
  const renderLab = () => {
    const L = window.LAB; if (!L) return;
    const en = root.getAttribute('lang') === 'en';
    const jl = document.querySelector('[data-lab-journal]');
    const tags = { agents: en ? 'agents' : 'агенти', base: en ? 'foundation' : 'фундамент', assistant: en ? 'assistant' : 'помічник', site: en ? 'site' : 'сайт' };
    const fmt = (d) => { const [y, m, dd] = d.split('-'); const mu = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'], me = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${+dd} ${(en ? me : mu)[+m - 1]} ${y}`; };
    if (jl) jl.innerHTML = L.journal.map((e) => `<li><time datetime="${e.date}">${fmt(e.date)}</time><p>${en ? e.en : e.uk}</p><span class="j-tag">${tags[e.tag] || e.tag}</span></li>`).join('');
    const al = document.querySelector('[data-lab-archive]');
    const st = { case: en ? 'became a case study' : 'стало кейсом', paused: en ? 'paused' : 'на паузі', closed: en ? 'closed' : 'закрито' };
    if (al) al.innerHTML = L.archive.map((e) => `<li><span class="a-meta ${e.status}">${st[e.status]}</span><h3>${en ? e.en : e.uk}</h3><p>${en ? e.en_p : e.uk_p}</p>${e.href ? `<a href="${e.href}">${en ? 'Read the case study →' : 'Читати кейс →'}</a>` : ''}</li>`).join('');
    const up = document.querySelector('[data-lab-updated]'); if (up) up.textContent = fmt(L.updated);
    document.querySelectorAll('[data-lab-stat]').forEach((el) => {
      const days = Math.max(0, Math.round((Date.now() - new Date(L.updated)) / 864e5));
      const n30 = L.journal.filter((e) => Date.now() - new Date(e.date) < 30 * 864e5).length;
      el.textContent = en ? `${n30} updates in 30 days · ${days === 0 ? 'updated today' : days + ' d since last update'}` : `${n30} ${n30 === 1 ? 'запис' : n30 < 5 ? 'записи' : 'записів'} за 30 днів · ${days === 0 ? 'оновлено сьогодні' : days + ' дн. з оновлення'}`;
    });
  };
  renderLab();
  document.addEventListener('lang:change', renderLab);

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

  const hasHero = !!document.querySelector('.hero');
  const intro = gsap.timeline({ defaults: { ease }, onComplete: () => (heroPlayed = true) });
  if (hasHero) intro
    .from('.site-header', { y: -20, autoAlpha: 0, duration: .8 }, 0)
    .from('.hero .eyebrow', { y: 20, autoAlpha: 0, duration: .7 }, .15)
    .from('[data-words] .wi', { yPercent: 110, duration: 1.1, stagger: .05, ease: 'power4.out' }, .25)
    .to('[data-photo] picture', { clipPath: 'inset(0% 0 0 0 round 20px)', duration: 1.4, ease: 'power4.inOut' }, .3)
    .from('[data-photo] img', { scale: 1.25, duration: 2.2, ease: 'power3.out' }, .3)
    .from('.hero .lead', { y: 24, autoAlpha: 0, duration: .9 }, .8)
    .from('.hero .cta-row', { y: 24, autoAlpha: 0, duration: .9 }, .95)
    .from('.hero-facts', { y: 24, autoAlpha: 0, duration: .9 }, 1.05)
    .from('.hero-facts li', { y: 14, autoAlpha: 0, duration: .7, stagger: .08 }, 1.15)
    .from('.marquee', { autoAlpha: 0, duration: 1 }, 1.4);
  if (!hasHero && document.querySelector('.case-cover')) {
    intro
      .from('.site-header', { y: -20, autoAlpha: 0, duration: .8 }, 0)
      .to('.cover-media img', { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
      .from('.cover-shade', { autoAlpha: 0, duration: 1.2 }, 0)
      .from('.cover-inner .back', { y: -12, autoAlpha: 0, duration: .7 }, .3)
      .from('.cover-inner .head-note', { y: 14, autoAlpha: 0, duration: .7 }, .45)
      .from('[data-words] .wi', { yPercent: 110, duration: 1.1, stagger: .06, ease: 'power4.out' }, .5)
      .from('.sm-lead > *, .case-hero .case-intro, .case-hero .ht-facts', { y: 24, autoAlpha: 0, duration: .9, stagger: .12 }, .9);
    gsap.to('.cover-media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.case-cover', start: 'top top', end: 'bottom top', scrub: .5 } });
  } else if (!hasHero && document.querySelector('.about-hero')) {
    intro
      .from('.site-header', { y: -20, autoAlpha: 0, duration: .8 }, 0)
      .from('.about-hero .eyebrow', { y: 16, autoAlpha: 0, duration: .7 }, .2)
      .from('[data-words] .wi', { yPercent: 110, duration: 1.1, stagger: .06, ease: 'power4.out' }, .3)
      .from('.about-alt, .about-text .lead, .about-text .cta-row', { y: 20, autoAlpha: 0, duration: .9, stagger: .1 }, .7)
      .from('.about-photo', { scale: .92, autoAlpha: 0, duration: 1.2, ease: 'power3.out' }, .3)
      .from('.about-hero .sm-facts li', { y: 14, autoAlpha: 0, duration: .7, stagger: .08 }, 1);
  } else if (!hasHero && document.querySelector('.lab-hero')) {
    intro
      .from('.site-header', { y: -20, autoAlpha: 0, duration: .8 }, 0)
      .from('.lab-hero .eyebrow', { y: 16, autoAlpha: 0, duration: .7 }, .2)
      .from('[data-words] .wi', { yPercent: 110, duration: 1.1, stagger: .06, ease: 'power4.out' }, .3)
      .from('.lab-hero .lead, .lab-hero .lab-updated', { y: 20, autoAlpha: 0, duration: .9, stagger: .1 }, .8);
  }


  /* ---------- Лабораторія: конвеєр агентів (детермінована петля) ---------- */
  document.querySelectorAll('[data-agents]').forEach((svg) => {
    const edge = (id) => svg.querySelector(`[data-e="${id}"]`);
    const pks = [...svg.querySelectorAll('.pk')];
    const agents = [...svg.querySelectorAll('.n-a')];
    const qa = svg.querySelector('.n-q'), out = svg.querySelector('.n-out');
    const travel = (pk, id, dur, reverse) => {
      const p = edge(id); const len = p.getTotalLength(); const o = { t: 0 };
      return gsap.to(o, { t: 1, duration: dur, ease: 'power1.inOut',
        onStart: () => { p.classList.add('hot'); gsap.set(pk, { opacity: 1 }); },
        onUpdate: () => { const pt = p.getPointAtLength((reverse ? 1 - o.t : o.t) * len); gsap.set(pk, { attr: { cx: pt.x, cy: pt.y } }); },
        onComplete: () => { p.classList.remove('hot'); gsap.set(pk, { opacity: 0 }); } });
    };
    const reset = () => { agents.forEach((a) => { a.classList.remove('busy', 'done'); gsap.set(a.querySelector('.a-prog'), { strokeDashoffset: 94.2 }); }); qa.classList.remove('busy', 'ok'); out.classList.remove('lit'); };
    const build = () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, onRepeat: reset });
      tl.add(travel(pks[0], 'e-in', .7), 0);
      tl.to(svg.querySelector('.orb'), { attr: { r: 21 }, duration: .25, yoyo: true, repeat: 1 }, .7);
      agents.forEach((a, i) => {
        const t0 = 1 + i * .12;
        tl.add(travel(pks[i], `e-o${i}`, .6), t0);
        tl.call(() => a.classList.add('busy'), null, t0 + .6);
        tl.to(a.querySelector('.a-prog'), { strokeDashoffset: 0, duration: .9 + i * .25, ease: 'power1.inOut' }, t0 + .6);
        tl.call(() => { a.classList.remove('busy'); a.classList.add('done'); }, null, t0 + 1.5 + i * .25);
        tl.add(travel(pks[i], `e-q${i}`, .55), t0 + 1.55 + i * .25);
      });
      tl.call(() => qa.classList.add('busy'), null, 3.1);
      // перевірка повертає A3 на доробку
      tl.add(travel(pks[2], 'e-q2', .5, true), 3.9);
      tl.call(() => { agents[2].classList.remove('done'); agents[2].classList.add('busy'); gsap.set(agents[2].querySelector('.a-prog'), { strokeDashoffset: 94.2 }); }, null, 4.4);
      tl.to(agents[2].querySelector('.a-prog'), { strokeDashoffset: 0, duration: .6 }, 4.45);
      tl.call(() => { agents[2].classList.remove('busy'); agents[2].classList.add('done'); }, null, 5.05);
      tl.add(travel(pks[2], 'e-q2', .5), 5.1);
      tl.call(() => { qa.classList.remove('busy'); qa.classList.add('ok'); }, null, 5.7);
      tl.add(travel(pks[4], 'e-out', .5), 6.1);
      tl.call(() => out.classList.add('lit'), null, 6.6);
      return tl;
    };
    let tl = null;
    const start = () => { if (!tl) tl = build(); else tl.play(); };
    const stopTl = () => { if (tl) tl.pause(); };
    if (reduce) { agents.forEach((a) => a.classList.add('done')); qa.classList.add('ok'); out.classList.add('lit'); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stopTl())), { threshold: .25 }).observe(svg);
    else start();
  });

  document.querySelectorAll('.lab-base').forEach((v) => {
    const q = (sel) => v.querySelectorAll(sel);
    const tl = gsap.timeline({ scrollTrigger: { trigger: v, start: 'top 80%', once: true }, defaults: { ease } });
    gsap.set(q('.f2 .col'), { scaleY: 0 });
    tl.from(q('.floor'), { autoAlpha: 0, duration: .8 }, 0)
      .fromTo(q('.f1'), { y: 30 }, { y: 0, autoAlpha: 1, duration: .8 }, .1)
      .to(q('.lbl:nth-child(1)'), { autoAlpha: 1, duration: .4 }, .7)
      .to(q('.f2'), { autoAlpha: 1, duration: .2 }, .8)
      .to(q('.f2 .col'), { scaleY: 1, duration: .7, stagger: .08, ease: 'power2.out' }, .8)
      .to(q('.lbl:nth-child(2)'), { autoAlpha: 1, duration: .4 }, 1.4)
      .fromTo(q('.f3'), { y: 40 }, { y: 0, autoAlpha: 1, duration: .9 }, 1.5)
      .to(q('.lbl:nth-child(3)'), { autoAlpha: 1, duration: .4 }, 2.2)
      .fromTo(q('.f4'), { y: 40 }, { y: 0, autoAlpha: 1, duration: .9 }, 2.3)
      .to(q('.f5'), { autoAlpha: 1, duration: .5 }, 3)
      .to(q('.lbl:nth-child(4)'), { autoAlpha: 1, duration: .4 }, 3);
  });

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = +el.dataset.count; const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.6, ease: 'power2.out', delay: 1.25, onUpdate: () => (el.textContent = Math.round(obj.v)) });
  });

  document.querySelectorAll('.section-head').forEach((head) => {
    gsap.from(head.children, { scrollTrigger: { trigger: head, start: 'top 85%', once: true, onEnter: () => head.classList.add('in') }, y: 24, autoAlpha: 0, duration: .9, stagger: .1, ease });
  });

  const groups = [
    ['.manifesto li', .07], ['.about-strip > *', .12],
    ['.step', .1], ['.tools', 0], ['.skills li', .05], ['.sub-head', 0],
    ['.works-filter', 0], ['.work', .03], ['.works-note', 0],
    ['.case-intro', 0], ['.case-block', .07],
    ['.sm-hero', 0], ['.sm-cols > div', .1], ['.sm-grid figure', .08], ['.sm-foot', 0], ['.case-card', .1], ['.next-case', 0],
    ['.now-list li', .07],
    ['.contact-lead', 0], ['.c-card', .1], ['.contact-social', 0],
    ['.cta', 0], ['.case-cta', 0], ['.lab-card', .12], ['.stream', 0], ['.pipe', .08], ['.pipe-result', 0], ['.journal li', .05], ['.faq', .06], ['.about-cols > *', .12], ['.archive li', .06], ['.tt-story', 0], ['.tt-nums li', .06], ['.tt-how-text p', .08],
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
    document.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('pointerenter', () => gsap.to(el, { y: -3, duration: .3, ease, overwrite: 'auto' }));
      el.addEventListener('pointerleave', () => gsap.to(el, { y: 0, duration: .4, ease, overwrite: 'auto' }));
    });
  }

  if (hasHero) gsap.to('[data-photo]', { y: 80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
