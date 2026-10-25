# Портфоліо — Олександр Бенца

Статичний сайт без збірки: `index.html` + `assets/`. Жодних залежностей.

## Локально

Відкрий `index.html` у браузері або підніми будь-який статичний сервер:

```bash
npx serve .
```

## Деплой

GitHub Pages через Actions (`.github/workflows/deploy.yml`). Деплоїться при пуші в `main`.

Один раз у налаштуваннях репозиторію: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Адреса: https://alex-ux-droid.github.io/portfolio/

## Як правити контент

Увесь текст живе в `index.html`, секції підписані коментарями (`HERO`, `THINK`, `WORK`, `WORKS`, `CASE`, `NOW`, `CONTACT`).
Роботи — список `.works-list` у секції `WORKS`: один `<li class="work" data-cat="...">` на роботу, категорії для фільтра: `system`, `web`, `docs`, `deck`, `own`.
Фото — `assets/img/portrait*.jpg|webp`; заміни файли з тими самими іменами.
Кольори та шрифти — у `assets/styles.css`, блок `:root` (світла) і блоки з `data-theme="dark"` (темна). Шрифт — Golos Text з Google Fonts.
Анімації — `assets/script.js` (GSAP + ScrollTrigger + Lenis, вендорені в `assets/vendor/`).
Соцмережі — закоментований блок у секції `CONTACT`.
