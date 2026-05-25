# Nero Network Office Page Cloud Instructions

Язык работы: русский.

## Главное правило

Для полной страницы-лонгрида **нельзя** выполнять ролевую работу одним Cloud Agent.

Текущий Cloud Agent работает как **Директор-оркестратор**. `director` — это не отдельный субагент пайплайна, поэтому **не вызывай отдельный Task или команду с именем director**.

Директор запускает роли:

`kirill → seo-kolya || artyom → zhenya → artur → alina || boris → natasha → yura → qa || lenya`

Если Cloud API не принимает имена `kirill`, `seo-kolya`, `artyom` и т.д. как `Task` types, используй **fallback через отдельные `generalPurpose` Task**:

- каждый `generalPurpose` Task получает **короткий контракт роли**: имя роли, входной файл/фрагмент, точный маркер результата, запреты и путь к `agents/<role>.md`;
- если у роли есть skill, передай **путь** `skills/<skill>/SKILL.md` и только критичные выдержки для текущего шага; полный текст skill не копируй без необходимости;
- один `generalPurpose` Task = одна роль, один блок handoff/fragment;
- параллельные пары всё равно запускаются отдельными Task, а не выполняются parent-agent.

Если недоступен даже `generalPurpose` Task или среда вообще не даёт запускать отдельные Task, нужно **остановиться с блокером**:

`❌ БЛОКЕР: Cloud Agent не может запускать отдельные Task/subagents даже через generalPurpose. Не выполняю single-agent pipeline.`

## Что считать ошибкой

- Parent Cloud Agent сам пишет лонгрид вместо отдельного Task `zhenya` / `generalPurpose` с ролью Жени.
- Parent Cloud Agent сам делает hero вместо отдельного Task `alina` / `generalPurpose` с ролью Алины.
- Parent Cloud Agent сам делает блок статьи вместо отдельного Task `boris` / `generalPurpose` с ролью Бориса.
- Parent Cloud Agent сам верстает страницу вместо отдельного Task `natasha` / `generalPurpose` с ролью Наташи.
- Parent Cloud Agent сам вставляет рекламу вместо отдельного Task `artur` / `generalPurpose` с ролью Артура.
- Cloud Agent публикует без блока `=== ЮРА (ПУБЛИКАЦИЯ) ===`.
- Cloud Agent создаёт короткую статью вместо лонгрида 8k–20k+ знаков.

## Handoff

Данные между ролями идут через:

- `.cursor/nero-network-handoff.md`
- `.cursor/nero-network-fragments/`

Параллельные роли пишут только во фрагменты:

- `kolya.md`
- `artyom.md`
- `alina.md`
- `boris.md`
- `qa.md`
- `lenya.md`

Директор переносит фрагменты в handoff и проверяет маркеры:

- `=== КИРИЛЛ (НОВОСТЬ ДНЯ) ===`
- `=== КОЛЯ (SEO-ЯДРО) ===`
- `=== АРТЁМ (RESEARCH) ===`
- `=== ЖЕНЯ (ЛОНГРИД) ===`
- `=== АРТУР (CTA И РЕКЛАМА) ===`
- `=== АЛИНА (HERO) ===`
- `=== БОРИС (БЛОК СТАТЬИ, НЕ HERO) ===`
- `=== НАТАША (HTML СТРАНИЦЫ) ===`
- `=== ЮРА (ПУБЛИКАЦИЯ) ===`
- `=== МАКС (QA) ===`
- `=== ЛЁНЯ (SEO-АУДИТ) ===`

## Публикация

Юра публикует только через SSH/SCP/SFTP/FTP как `page-{slug}.php` в активную тему `${WP_THEME_SLUG}`.
В Cursor Cloud сначала использовать SSH/SCP/SFTP; FTP использовать только если SSH/SCP/SFTP недоступны.
WordPress API / REST API / MCP blob flow для страниц с `<script>` и `<canvas>` запрещён.

Секреты брать только из Cloud Secrets / env vars. Не печатать секреты в ответах, PR body, handoff или логах.

## Git hygiene

`.cursor/nero-network-handoff.md` и `.cursor/nero-network-fragments/` — runtime-файлы пайплайна. Их можно создавать и читать во время автоматизации, но **нельзя коммитить** в Git/PR.

В коммит должны попадать только устойчивые артефакты:

- обновления правил/skills/agents;
- журналы `shared/published-pages.md`, `shared/session-handoff.md`, `shared/kirill-news-ledger.md`;
- если страница опубликована, обязательно шаблон `wordpress-theme/page-{slug}.php` или другой воспроизводимый файл шаблона, принятый в этом репозитории.
