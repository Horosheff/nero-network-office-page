# Быстрый старт настройки

1. Скопируйте `.env.example` в `.env` или перенесите переменные в Cursor Cloud Secrets.
2. Для локального запуска скопируйте `shared/hosting-credentials.local.example` в `shared/hosting-credentials.local`.
3. Укажите активную тему в `WP_THEME_SLUG`.
4. Укажите бренд и нишу сайта: `SITE_BRAND`, `SITE_NICHE`.
5. Заполните `WP_SITE_URL`, `PUBLIC_SITE_URL`, `REMOTE_SITE_ROOT`, `FTP_*`, `SSH_*`.
6. Укажите рекламные и CTA-ссылки, если они нужны.
7. Проверьте настройку: `python scripts/check-config.py --local`.
8. Для сетевой проверки: `python scripts/check-config.py --local --network`.
9. Запустите задачу в Cursor: создать WordPress-страницу через Nero Network Office Page.

Если критичных переменных нет, агент публикации должен остановиться с блокером и не просить пароли в чате.
