# Портфоліо — Олександр Бенца

Статичний сайт без збірки: `index.html`, сторінки кейсів у `cases/`, ресурси в `assets/`. Жодних залежностей на рантаймі, GSAP вендорений.

## Деплой на Cloudflare Pages

Проєкт підключається до GitHub-репо напряму (Workers & Pages → Create → Pages, або Workers з Git: конфіг у `wrangler.jsonc`, зайве в `.assetsignore`).
Налаштування збірки:

- Framework preset: None
- Build command: `sed -i "s/?v=dev/?v=${CF_PAGES_COMMIT_SHA:0:8}/g" index.html 404.html cases/*.html lab/*.html`
- Build output directory: `/`

Команда збірки підставляє хеш коміту в `?v=` для CSS/JS, щоб після оновлення браузери не тримали старі файли.
`_headers` задає кеш для `/assets/*` і security-заголовки. `404.html` розрахований на хостинг у корені домену.

Після підключення домену замінити `https://alexbentsa.com/` на новий домен у всіх сторінках, `sitemap.xml` і `robots.txt`.

## SEO

`sitemap.xml` і `robots.txt` у корені, `404.html` для GitHub Pages. На кожній сторінці: canonical, hreflang uk/en/x-default, Open Graph, Twitter, JSON-LD (Person + WebSite на головній, Article + BreadcrumbList на кейсах, CollectionPage на списку кейсів, WebPage на лабораторії). Додаючи сторінку, допиши її в `sitemap.xml`.

## Локально

```bash
npx serve .
```

## Деплой

GitHub Pages через Actions (`.github/workflows/deploy.yml`). Деплоїться при пуші в `main` або `claude/determined-ritchie-6vjlx6`.
Адреса: https://alexbentsa.com/

## Правило розкладки

1. Секції (`.section`) завжди на всю ширину екрана: фон, лінії, смуги.
2. Контент усередині — у `.wrap`: по центру, `max-width: var(--wrap)` (1320px), бічні поля `--gutter` ростуть з екраном.
3. Блоки на весь екран виходять з `.wrap`: фото в hero (bleed вправо), marquee, темна смуга «Підхід» (`.band`), контактна смуга (`.band-2`).
4. Порожні поля по боках робочі: на ≥1500px туди виноситься великий номер секції.
5. Базовий розмір шрифту трохи росте з екраном (`html { font-size: clamp(...) }`), тому на 4K усе масштабується.

Коментар з цим правилом є на початку `assets/styles.css`.

## Дві мови

Українська — джерело, в `index.html`. Англійська — `assets/i18n.js`, ключ = атрибут `data-i18n` елемента.
Перемикач у шапці, вибір запам'ятовується; `?lang=en` у посиланні відкриває англійську одразу.
Додаючи текст: постав `data-i18n="ключ"` в HTML і додай ключ у `i18n.js`.

## Кукі

Банер у кінці `index.html` (`.cookie`). Згода зберігається у localStorage.
Аналітику підключати після події `consent:accepted` у `assets/script.js` (є коментар). Поки аналітики немає.

## Кейси

На головній блок `CASES` з картками. Повний розбір кожного кейсу — окрема сторінка в `cases/` (`index.html` — усі кейси, сюди веде кнопка «Портфоліо»; `smirnovich.html`, `health-time.html`, `turbo-terminal.html`).
Новий кейс: скопіюй одну зі сторінок, заміни контент, додай картку на головній і ключі в `i18n.js`. PDF кейсів лежать в `assets/docs/`, скріншоти в `assets/img/<кейс>/`.

## Контент

Секції підписані коментарями: `HERO`, `THINK`, `WORK`, `WORKS`, `CASE`, `NOW`, `CONTACT`.
Роботи — `.works-list`: один `<li class="work" data-cat="...">` на роботу; категорії фільтра: `system`, `web`, `docs`, `deck`, `own`.
Фото — `assets/img/portrait*.jpg|webp`, заміняй файли з тими самими іменами.
Соцмережі — закоментований блок у секції `CONTACT`.

## Форма контакту

Модалка `#contact-modal` (кнопка «Написати мені» в CTA перед футером). Поки `data-endpoint=""` порожній, форма відкриває поштовий клієнт (mailto). Щоб листи приходили без пошти, впиши у `data-endpoint` URL вебхука (n8n, Web3Forms, Formspree): форма POST-ить JSON `{name, contact, message, page, lang}`.
