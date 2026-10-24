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

Увесь текст живе в `index.html`, секції підписані коментарями (`HERO`, `ABOUT`, `WORK`, `CASE`, `404BUREAU`, `CONTACT`).
Кольори та шрифти — у `assets/styles.css`, блок `:root`.
Соцмережі — закоментований блок у секції `CONTACT`.
