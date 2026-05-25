# Быстрый старт настройки

1. Запустите первичную настройку: `python scripts/first-run.py`.
2. Скрипт создаст `.env` из `.env.example` и `shared/hosting-credentials.local` из `.example`, не перезаписывая существующие файлы.
3. Для повторного создания файлов используйте `python scripts/first-run.py --force`.
4. Укажите активную тему в `WP_THEME_SLUG`.
5. Укажите бренд и нишу сайта: `SITE_BRAND`, `SITE_NICHE`.
6. Заполните `WP_SITE_URL`, `PUBLIC_SITE_URL`, `REMOTE_SITE_ROOT`, `FTP_*`, `SSH_*`.
7. Укажите рекламные и CTA-ссылки, если они нужны.
8. Проверьте настройку: `python scripts/check-config.py --local`.
9. Для сетевой проверки: `python scripts/check-config.py --local --network`.
10. Запустите задачу в Cursor: создать WordPress-страницу через Nero Network Office Page.

Если критичных переменных нет, агент публикации должен остановиться с блокером и не просить пароли в чате.
