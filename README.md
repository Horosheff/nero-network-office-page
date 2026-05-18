# Nero Network Office Page 0.1

Переносимый Cursor-плагин для подготовки и публикации WordPress-страниц: тема/инфоповод, SEO-ядро, research, лонгрид, CTA, hero, визуальный блок, вёрстка, публикация через FTP/SSH, QA и SEO-аудит.

## Что внутри

- `.cursor-plugin/plugin.json` — манифест Cursor Plugin, версия `0.1.0`.
- `rules/`, `skills/`, `agents/`, `commands/` — роли и процесс офиса.
- `shared/hosting-credentials.env.example` и `.env.example` — полный список переменных для сайта, FTP, SSH, темы WordPress и CTA.
- `shared/hosting-credentials.local.example` — пример локального файла, который копируется в `shared/hosting-credentials.local`.
- `shared/credentials.py` — загрузка значений из environment variables или локального `shared/hosting-credentials.local`.
- `wordpress/page-nero-network-office-example.php` — нейтральный пример PHP-шаблона для первой проверки WordPress-публикации.
- `docs/AGENTS-SCHEME.md` — схема агентов, роли, handoff и порядок пайплайна.

## Установка локально

1. Склонируйте или распакуйте репозиторий.
2. Скопируйте папку в `%USERPROFILE%\.cursor\plugins\local\nero-network-office-page` или сделайте symlink на этот каталог.
3. Скопируйте `.env.example` в `.env` для локального запуска или перенесите переменные в Cursor Cloud Secrets.
4. Для локального fallback скопируйте `shared/hosting-credentials.local.example` в `shared/hosting-credentials.local`.
5. Заполните `WP_SITE_URL`, `PUBLIC_SITE_URL`, `WP_THEME_SLUG`, `FTP_*`, `SSH_*`, `REMOTE_*` и CTA-поля.
6. Проверьте настройку командой `python scripts/check-config.py --local`.
7. Перезапустите Cursor или выполните Developer: Reload Window.

## Безопасность

Реальные доступы не входят в репозиторий. Файлы `.env`, `.env.*`, `shared/hosting-credentials.local`, приватные ключи и runtime-артефакты игнорируются через `.gitignore`.

## Схема агентов

Подробная схема ролей и пайплайна находится в `docs/AGENTS-SCHEME.md`.

Перед публикацией на GitHub выполните:

```powershell
git status
git diff -- .gitignore .env.example shared/hosting-credentials.env.example
```

## WordPress-публикация

Публикатор использует переменные окружения и должен публиковать `page-{slug}.php` в активную тему WordPress, заданную через `WP_THEME_SLUG` и фактический путь темы. Не храните домен, логины, пароли и affiliate-ссылки в правилах или скиллах, используйте env/secrets.

Для первой ручной проверки можно загрузить `wordpress/page-nero-network-office-example.php` в активную тему, создать страницу в WordPress и выбрать шаблон `Nero Network Office Example`.
