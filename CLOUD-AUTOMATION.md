# Nero Network Office Page: Cloud Automation Setup

Эта инструкция нужна, чтобы запускать Nero Network Office Page в Cursor Automations 3 раза в день.

## Что запускаем

Полный пайплайн:

`Кирилл → Коля||Артём → Женя → Артур → Алина||Борис → Наташа → Юра → Макс||Лёня`

Кирилл сам ищет одну лучшую новость дня, проверяет Wordstat, сверяет дубли по журналам и передаёт победителя в пайплайн страницы.

## Канонические файлы

- Handoff: `<PROJECT_ROOT>/.cursor/nero-network-handoff.md`
- Фрагменты параллельных агентов: `<PROJECT_ROOT>/.cursor/nero-network-fragments/`
- Ledger Кирилла: `<PROJECT_ROOT>/shared/kirill-news-ledger.md`
- Журнал опубликованных страниц: `<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md`
- Плагин: `<PROJECT_ROOT>/nero-network-office-page`
- Шаблон env/secrets: `<PROJECT_ROOT>/nero-network-office-page/shared/hosting-credentials.env.example`
- Локальный fallback, не для git: `<PROJECT_ROOT>/nero-network-office-page/shared/hosting-credentials.local`

## Cursor docs, по которым настроено

- Cloud Agents setup: https://cursor.com/docs/cloud-agent/setup.md
- Environment variables and secrets: https://cursor.com/docs/cloud-agent/setup.md#environment-variables-and-secrets
- Secret protection: https://cursor.com/docs/cloud-agent/security-network.md#secret-protection
- Automations: https://cursor.com/docs/cloud-agent/automations.md
- Self-hosted pool: https://cursor.com/docs/cloud-agent/self-hosted-pool.md
- MCP tools in Cloud Agents: https://cursor.com/docs/cloud-agent/capabilities.md#mcp-tools
- MCP config interpolation: https://cursor.com/docs/mcp.md#config-interpolation

## Почему нужен self-hosted worker

Обычный Cloud Agent подойдёт только если все нужные интеграции доступны в облаке Cursor:

- WebSearch/WebFetch;
- MCP Wordstat;
- FTP/SSH/WordPress-доступы;
- браузерная проверка;
- Node.js для IndexLift.

Если Wordstat MCP, FTP/SSH или секреты находятся локально/в приватной среде, запускай через self-hosted worker.

## Worker

На машине/сервере, где есть доступы и инструменты:

```powershell
cd "<PROJECT_ROOT>"
$env:CURSOR_API_KEY="YOUR_TEAM_OR_SERVICE_ACCOUNT_KEY"
agent worker start --pool --pool-name nero-network
```

Для постоянного worker:

```powershell
cd "<PROJECT_ROOT>"
$env:CURSOR_API_KEY="YOUR_TEAM_OR_SERVICE_ACCOUNT_KEY"
agent worker start --pool --pool-name nero-network --idle-release-timeout 600
```

## Secrets / env vars

Для worker должны быть доступны:

- env vars из `nero-network-office-page/shared/hosting-credentials.env.example`;
- доступ к MCP Wordstat (`user-mcp-kv` или аналог);
- доступ к интернету для WebSearch/WebFetch;
- Node.js для `nero-network-office-page/skills/indexlift-seo-auditor`.

В Cloud Cursor добавь реальные значения в Cloud Agents Dashboard → Secrets / Environment Variables. Для sensitive значений используй redacted secrets:

- `FTP_HOST`, `FTP_PORT`, `FTP_USER`, `FTP_PASSWORD`
- `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PASSWORD`
- `REMOTE_SITE_ROOT`, `REMOTE_WP_CONTENT`, `REMOTE_WP_THEMES`, `REMOTE_WP_PLUGINS`, `SSH_THEME_PATH`
- `WP_SITE_URL`, `WP_ADMIN_URL`, `PUBLIC_SITE_URL`
- `WP_CLI_BIN`, `PHP_BIN`, если WP-CLI запускается нестандартно

`hosting-credentials.local`, `.env`, приватные ключи и одноразовые FTP/SSH-скрипты не коммитить. Если используешь `mcp.json`, не хардкодь токены: используй `${env:NAME}` interpolation.

## Automation schedule

Создай Cursor Automation:

- Trigger: Schedule
- Cron: 3 раза в день, например:

```text
0 9,14,19 * * *
```

- Repository: репозиторий с этим проектом
- Branch: рабочая ветка публикации
- Worker pool: `nero-network`
- Environment install: off, если зависимости уже стоят на worker; on, если нужно ставить Node-пакеты
- Tools: MCP Wordstat, browser/web, shell/filesystem, при необходимости Slack/GitHub

## Automation prompt

```text
Ты работаешь в репозитории Nero Network Office Page.

Запусти полный пайплайн Nero Network Office Page для новости дня **через роли**.

0. Текущий Cloud Agent уже является Директором-оркестратором. Не вызывай отдельный Task или команду с именем director: директор не является отдельной ролью пайплайна.
   Директор запускает только ролевых агентов: `kirill`, `seo-kolya`, `artyom`, `zhenya`, `artur`, `alina`, `boris`, `natasha`, `yura`, `qa`, `lenya`.
   Для каждой роли сначала используй project-agent Task соответствующего имени.
   Если Cloud API не принимает имя роли как Task type, используй fallback: **отдельный `generalPurpose` Task на эту одну роль**.
   Для каждого `generalPurpose` Task передай короткий контракт роли: имя роли, входной файл/фрагмент, точный маркер результата, запреты, путь `agents/<role>.md` и путь соответствующего `skills/<skill>/SKILL.md`. Полный текст больших skill не копируй без необходимости.
   Один Task = одна роль. Не объединяй роли.
   Если недоступен даже `generalPurpose` Task или невозможно запускать отдельные Task, остановись с блокером:
   `❌ БЛОКЕР: Cloud Agent не может запускать отдельные Task/subagents даже через generalPurpose. Не выполняю single-agent pipeline.`
1. Директор-оркестратор может сбрасывать handoff, запускать отдельные Task/subagents по ролям, читать фрагменты, переносить блоки в handoff и проверять маркеры. НЕ выполняй роли сам.
2. Перед стартом сбрось <PROJECT_ROOT>/.cursor/nero-network-handoff.md одной строкой "# Nero Network — новая сессия".
3. Очисти фрагменты текущей сессии в <PROJECT_ROOT>/.cursor/nero-network-fragments/.
4. Запусти Кирилла: он должен сам найти одну лучшую свежую новость по нейросетям/автоматизации, проверить Wordstat, проверить дубли по <PROJECT_ROOT>/shared/kirill-news-ledger.md и <PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md, записать selected в ledger и блок === КИРИЛЛ (НОВОСТЬ ДНЯ) === в handoff.
5. Если Кирилл не нашёл недублирующуюся тему, остановись и запиши блокер.
6. Далее выполни цепочку: Коля||Артём → Женя → Артур → Алина||Борис → Наташа → Юра → Макс||Лёня.
7. Параллельные агенты не пишут напрямую в handoff: они пишут во фрагменты <PROJECT_ROOT>/.cursor/nero-network-fragments/, а Директор переносит блоки в handoff без дублей.
8. Юра публикует только SSH/SCP/SFTP/FTP как `page-{slug}.php` в активную тему `${WP_THEME_SLUG}`; в Cloud сначала SSH/SCP/SFTP, НЕ WordPress API / REST API / MCP blob flow.
9. До QA проверь, что в handoff есть === ЮРА (ПУБЛИКАЦИЯ) === и live HTML содержит main#primary, {slug}-page, hero/canvas-маркеры.
10. После публикации Юра обновляет <PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md и, если тема пришла от Кирилла, <PROJECT_ROOT>/shared/kirill-news-ledger.md статусом published.
11. Если Макс или Лёня нашли проблемы, максимум 2 цикла Юра → Макс||Лёня.

Запрещено:
- самому писать лонгрид вместо Жени;
- самому делать hero вместо Алины;
- самому делать визуальный блок вместо Бориса;
- самому верстать страницу вместо Наташи;
- самому вставлять рекламу вместо Артура;
- самому публиковать вместо Юры;
- самому делать QA/SEO-аудит вместо Макса и Лёни;
- объединять несколько ролей в один `generalPurpose` Task.

Финальный ответ: URL опубликованной страницы или блокер с причиной.
```

## После каждого запуска

Проверь, что изменились:

- `<PROJECT_ROOT>/shared/kirill-news-ledger.md`
- `<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md`
- при необходимости файлы страницы/шаблона

Если Automation работает через PR, смерджи PR, чтобы следующий запуск видел свежий ledger и не повторял новость.
