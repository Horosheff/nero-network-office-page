# Установка Nero Network Office Page 0.2

Эта инструкция рассчитана на человека, который впервые получает репозиторий и должен настроить плагин под свой WordPress-сайт.

## 1. Получить репозиторий

```powershell
git clone <GITHUB_REPOSITORY_URL> nero-network-office-page
cd nero-network-office-page
```

Если репозиторий передали архивом, распакуйте папку `nero-network-office-page` в удобное место.

## 2. Подключить как Cursor Plugin

Вариант с копированием:

```powershell
Copy-Item -Recurse -Force ".\nero-network-office-page" "$env:USERPROFILE\.cursor\plugins\local\nero-network-office-page"
```

Вариант для разработки через symlink из PowerShell с правами администратора:

```powershell
New-Item -ItemType SymbolicLink `
  -Path "$env:USERPROFILE\.cursor\plugins\local\nero-network-office-page" `
  -Target "C:\path\to\nero-network-office-page"
```

После подключения перезапустите Cursor или выполните `Developer: Reload Window`.

## 3. Настроить доступы

Скопируйте пример локального файла:

```powershell
Copy-Item ".\shared\hosting-credentials.local.example" ".\shared\hosting-credentials.local"
```

Заполните `shared/hosting-credentials.local` или перенесите такие же переменные в Cursor Cloud Secrets / Environment Variables.

Минимум для публикации:

- `WP_SITE_URL`
- `PUBLIC_SITE_URL`
- `WP_THEME_SLUG`
- `REMOTE_SITE_ROOT`
- `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
- `SSH_HOST`, `SSH_USER`, `SSH_PASSWORD`

CTA и реклама опциональны:

- `PRIMARY_CTA_LABEL`, `PRIMARY_CTA_URL`
- `SECONDARY_CTA_LABEL`, `SECONDARY_CTA_URL`
- `AD_BANNER_URL`, `AD_BANNER_IMAGE_URL`, `AD_BANNER_ALT`

Не вставляйте реальные пароли в чат, README, rules, skills или git-коммиты.

## 4. Проверить конфигурацию

Для первого запуска создайте локальные файлы настройки:

```powershell
python .\scripts\first-run.py
```

Скрипт создаёт `.env` и `shared/hosting-credentials.local` из `.example`-файлов и не перезаписывает существующие файлы. Для пересоздания используйте `python .\scripts\first-run.py --force`.

Запустите:

```powershell
python .\scripts\check-config.py --local
```

Для проверки сетевых доступов:

```powershell
python .\scripts\check-config.py --local --network
```

Скрипт не печатает значения секретов. Он показывает только, какие переменные заполнены, доступен ли сайт, проходит ли FTP/SSH-подключение и похожа ли тема WordPress на настроенную.

## 5. Установить зависимости SEO-аудита

```powershell
cd .\skills\indexlift-seo-auditor
npm install
cd ..\..
```

## 6. Проверить WordPress-шаблон

Для ручной первой проверки загрузите файл:

`wordpress/page-nero-network-office-example.php`

в активную тему WordPress. Затем создайте страницу в админке и выберите шаблон `Nero Network Office Example`.

## 7. Запустить офис

В Cursor попросите:

```text
Создай WordPress-страницу через Nero Network Office Page по теме: <тема страницы>
```

Агент должен пройти цепочку:

`Кирилл → Коля||Артём → Женя → Артур → Алина||Борис → Наташа → Юра → Макс||Лёня`

Если доступы не заполнены, публикатор Юра должен остановиться с блокером и не просить пароли в чате.

## 8. Cursor Cloud / Automations

Для Cloud Agents не используйте `hosting-credentials.local`. Перенесите переменные из `.env.example` в Cursor Cloud Secrets / Environment Variables.

Если FTP/SSH или MCP Wordstat доступны только с вашей машины, используйте self-hosted worker pool. Подробности в `CLOUD-AUTOMATION.md`.
