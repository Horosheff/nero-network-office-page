# Где хранить доступы к хостингу

## Cloud: секреты через Environment Variables

Для Cursor Cloud / Automations реальные значения хранятся **только** в Cloud Agents Secrets / Environment Variables. В GitHub коммитится только список имён переменных: **`shared/hosting-credentials.env.example`**.

Агент **Юра** и helper-скрипты берут значения сначала из `os.environ`. Локальный файл **`shared/hosting-credentials.local`** — только fallback для запуска на твоей машине или self-hosted worker.

## Локальный fallback

- Файл **`hosting-credentials.local`** указан в **`.gitignore`** плагина и **не должен** попадать в git. Перед `git push` проверь, что он не в индексе.
- Для Cloud не копируй этот файл в репозиторий и не вставляй его в промпт. Перенеси значения в Secrets.
- Шаблон имён: **`shared/hosting-credentials.env.example`**.

## Список полей (создай файл вручную или скопируй блок)

Имя файла: **`nero-network-office-page/shared/hosting-credentials.local`**

```
# Сайт
WP_SITE_URL=
WP_ADMIN_URL=
# Публичный домен для ссылок в ответах (например https://${PUBLIC_SITE_HOST}); если пусто — используется WP_SITE_URL
PUBLIC_SITE_URL=

# SSH
SSH_HOST=
SSH_PORT=22
SSH_USER=
SSH_PASSWORD=
REMOTE_SITE_ROOT=
REMOTE_WP_CONTENT=
REMOTE_WP_THEMES=
REMOTE_WP_PLUGINS=
SSH_THEME_PATH=

# SFTP
SFTP_HOST=
SFTP_PORT=22
SFTP_USER=
SFTP_PASSWORD=

# FTP (если нужен)
FTP_HOST=
FTP_PORT=21
FTP_USER=
FTP_PASSWORD=

PANEL_URL=
NOTES=
```

Строки с `#` — комментарии. Заполни значения под свой хостинг.

## Что туда положить

- **SSH / SFTP / FTP** — хост, порт, логин, пароль, пути к `public_html` и к `wp-content/themes`.
- **Заметки** — поле `NOTES`.

Дополнительные поля для helper-скриптов:

```
WP_CLI_BIN=wp
PHP_BIN=
```

`PHP_BIN` нужен только если WP-CLI запускается через конкретный PHP binary.

## Кто читает секреты

Агент **Юра** (скилл **publisher-yura**) в начале задачи читает env/secrets. Для локального запуска допускается **`hosting-credentials.local`**. Если env и локальный файл отсутствуют или критичные поля пусты — Юра возвращает блокер и не просит повторить пароли в чате.

Если плагин внутри большого репозитория — добавь в **корневой** `.gitignore` строку `**/hosting-credentials.local`.

## Дубликат вне репозитория (опционально)

Можно хранить копию в безопасном каталоге и указать путь в `NOTES` — тогда в задаче для Юры укажи явный путь к файлу.
