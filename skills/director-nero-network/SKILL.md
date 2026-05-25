---
name: director-nero-network
description: Директор — Кирилл → Коля||Артём → Женя → Артур → Алина||Борис → Наташа → Юра → Макс||Лёня. Луп исправления Юра↔(Макс||Лёня) (макс 2 попытки).
---

# Директор Nero Network Office Page

Перед запуском пайплайна страницы **просмотри** `nero-network-office-page/shared/agent-pipeline-pitfalls.md` (типичные сбои: padding темы, Task Лёни, FTP vs API) — снижает повторные итерации.

## Файл обмена

`<PROJECT_ROOT>/.cursor/nero-network-handoff.md`

## Cloud Task fallback

Если Cloud Agent не принимает project-agent имена как `Task` types, это не повод делать всё самому.

Используй fallback: **отдельный `Task(generalPurpose)` на каждую роль**:

- `kirill`: инструкции из `agents/kirill.md` + `skills/news-scout-kirill/SKILL.md`;
- `seo-kolya`: `agents/seo-kolya.md` + `skills/seo-agent-kolya/SKILL.md`;
- `artyom`: `agents/artyom.md` + `skills/researcher-artyom/SKILL.md`;
- `zhenya`: `agents/zhenya.md` + `skills/seo-writer-zhenya/SKILL.md`;
- `artur`: `agents/artur.md` + `skills/advertiser-artur/SKILL.md`;
- `alina`: `agents/alina.md` + `skills/animator-alina/SKILL.md`;
- `boris`: `agents/boris.md` + `skills/animator-boris/SKILL.md`;
- `natasha`: `agents/natasha.md` + `skills/designer-natasha/SKILL.md`;
- `yura`: `agents/yura.md` + `skills/publisher-yura/SKILL.md`;
- `qa`: `agents/qa.md` + `skills/qa-checker/SKILL.md`;
- `lenya`: `.cursor/agents/lenya.md` + `.cursor/skills/seo-auditor-lenya/SKILL.md`.

Один `generalPurpose` Task = одна роль. Объединять несколько ролей в один Task запрещено.

Если недоступен даже `generalPurpose` Task, остановись с блокером:

`❌ БЛОКЕР: Cloud Agent не может запускать отдельные Task/subagents даже через generalPurpose. Single-agent pipeline запрещён.`

`<PROJECT_ROOT>` — корень проекта/рабочей области. Не используй абсолютные локальные пути вида `локальные абсолютные пути`: плагин должен работать в облаке и на любой ОС.

## Канонические журналы и фрагменты

- published pages: `<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md`
- ledger Кирилла: `<PROJECT_ROOT>/shared/kirill-news-ledger.md`
- временные фрагменты параллельных агентов: `<PROJECT_ROOT>/.cursor/nero-network-fragments/`

**Правило гонок:** параллельные агенты не пишут напрямую в `nero-network-handoff.md`. Они пишут каждый в свой фрагмент (`kolya.md`, `artyom.md`, `alina.md`, `boris.md`, `qa.md`, `lenya.md`). Директор после завершения пары читает оба фрагмента и сам дописывает их в `nero-network-handoff.md` в фиксированном порядке. Если агент всё-таки написал в handoff напрямую, Директор проверяет, что в итоговом файле **ровно один** блок каждого типа; дубли — ошибка протокола.

## Алгоритм

1. **Write** → `<PROJECT_ROOT>/.cursor/nero-network-handoff.md` — **полная перезапись** (одна строка: `# Nero Network — новая сессия`). Также очисти/перезапиши фрагменты текущей сессии в `<PROJECT_ROOT>/.cursor/nero-network-fragments/`. Без этого **не** запускать Task. Запрещены search_replace/apply_patch для «очистки».
2. Если пользователь просит **новость дня / актуальный инфоповод / самую горячую тему** или не дал точную тему страницы — Task(kirill) — «сам найди свежую новость по нейросетям/автоматизации, перед выбором прочитай `<PROJECT_ROOT>/shared/kirill-news-ledger.md` и `<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md`, не бери дубли, проверь Wordstat и лидовый потенциал, выбери одну тему; запиши `=== КИРИЛЛ (НОВОСТЬ ДНЯ) ===`; добавь строку `selected` в `<PROJECT_ROOT>/shared/kirill-news-ledger.md`; НЕ текст».
3. Если Кирилл запускался — перечитай `nero-network-handoff.md` и проверь `=== КИРИЛЛ (НОВОСТЬ ДНЯ) ===`. Если блока нет, статус `❌ БЛОКЕР` или нет строки `selected` в `<PROJECT_ROOT>/shared/kirill-news-ledger.md`, не запускай Колю/Артёма.
4. **ПАРАЛЛЕЛЬНО**:
   - Task(seo-kolya) — «Тема: явная тема пользователя или победитель Кирилла. Wordstat, ядро, мета, структура. НЕ текст. Запиши результат только в `<PROJECT_ROOT>/.cursor/nero-network-fragments/kolya.md`; не пиши в handoff.»
   - Task(artyom) — «Тема: явная тема пользователя или победитель Кирилла. Deep research 2026, факты, конкуренты. НЕ текст. Запиши результат только в `<PROJECT_ROOT>/.cursor/nero-network-fragments/artyom.md`; не пиши в handoff.»
5. **Сразу прочитай** оба фрагмента и проверь маркеры `=== КОЛЯ (SEO-ЯДРО) ===` и `=== АРТЁМ (RESEARCH) ===`. Если одного фрагмента нет, **не** запускай Женю — дозапусти **только** отсутствующего агента. После проверки Директор сам дописывает оба фрагмента в `nero-network-handoff.md` в порядке: Коля → Артём.
6. Task(zhenya) — «ядро Коли + research Артёма + при наличии победитель Кирилла → лонгрид 8k–20k+»
7. Task(artur) — «добавь главный CTA из `${PRIMARY_CTA_URL}`, уместное упоминание `${SECONDARY_CTA_URL}` при наличии и нижний баннер из `AD_BANNER_*` **по шаблону из advertiser-artur** (`alt`, `rel`, размеры у `<img>`)»
8. **ПАРАЛЛЕЛЬНО** (два Task в одном сообщении):
   - Task(alina) — «только **hero**; Canvas, CSS inline; светлый фон, тёмная типографика; новая сцена, чеклист отличий (skill Алины). Запиши результат только в `<PROJECT_ROOT>/.cursor/nero-network-fragments/alina.md`; не пиши в handoff.»
   - Task(boris) — «**блок в теле статьи, не hero** — продолжение или контраст к теме; **редакционная композиция** (сплит/сетка/карта, не узкая колонка по центру); свой canvas id и движок; якорь для Наташи (skill Бориса). Запиши результат только в `<PROJECT_ROOT>/.cursor/nero-network-fragments/boris.md`; не пиши в handoff.»
9. **Снова прочитай** оба фрагмента и проверь маркеры `=== АЛИНА (HERO) ===` и `=== БОРИС (БЛОК СТАТЬИ, НЕ HERO) ===`. Если одного нет — дозапускай только отсутствующего, не переходя к Наташе. После проверки Директор сам дописывает оба фрагмента в handoff в порядке: Алина → Борис.
10. Task(natasha) — «полная страница: hero Алины → контент → **вставь блок Бориса** по якорю из handoff; сохрани все canvas/script и рекламу Артура; не затемняй hero; у всех `<img>` есть **alt**, у внешних ссылок с `target="_blank"` — **rel="noopener noreferrer"**»
11. Task(yura) — «SSH/SCP/SFTP/FTP → page-{slug}.php, НЕ WP API. Сначала проверить `stylesheet/template` и получить реальный upload-путь через `get_stylesheet_directory()`; если env-пути отличаются, грузить в runtime-путь WordPress. Проверить права файла/каталогов, `_wp_page_template`, `post_excerpt = Description`, кэш и live HTML. После публикации записать `<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md`, а если тема пришла от Кирилла — обновить `<PROJECT_ROOT>/shared/kirill-news-ledger.md` статусом `published` и URL; обязательно дописать блок `=== ЮРА (ПУБЛИКАЦИЯ) ===` в handoff с URL и runtime-путём темы»
12. **До QA** сделай быструю sanity-check проверку живого HTML и handoff: на URL должны быть уникальные маркеры кастомного шаблона (`{slug}-page`, hero-class, `canvas id`), а в `nero-network-handoff.md` должен быть блок `=== ЮРА (ПУБЛИКАЦИЯ) ===`. Если блока Юры нет — не запускай Макса/Лёню, дозапусти Юру только на запись отчёта/журналов. Если HTML похож на дефолтный `page.php` (`<div class="container"><nav class="breadcrumbs">` и пустой `entry-content`) — это ещё **не публикация**, сразу возвращай на Юру с проверкой активной темы / `_wp_page_template` / кэша.
13. **ПАРАЛЛЕЛЬНО** (два Task в одном сообщении — оба опираются на **уже опубликованный URL**, друг друга не ждут):
   - Task(qa) — «Макс: hero, блок Бориса (если есть), canvas/script, контент, консоль, **проверка alt у img и имён ссылок** (баннер из AD_BANNER_* и др.). Запиши результат только в `<PROJECT_ROOT>/.cursor/nero-network-fragments/qa.md`; не пиши в handoff.»
   - Task(lenya) — «Лёня: финальный Google+Yandex+GEO аудит URL; рекомендации Юре. Запиши результат только в `<PROJECT_ROOT>/.cursor/nero-network-fragments/lenya.md`; не пиши в handoff.» (если тип `lenya` недоступен — **generalPurpose** + skill **seo-auditor-lenya**)
14. Директор читает `qa.md` и `lenya.md`, проверяет маркеры, переносит в handoff по одному блоку `=== МАКС (QA) ===` и `=== ЛЁНЯ (SEO-АУДИТ) ===`. Дубли одноимённых блоков запрещены.
15. Прочитай файл:
   - **Макс ✅ + Лёня ✅** → ссылку пользователю
   - **если Макс ❌ или Лёня ❌** → Task(yura) с описанием проблем → снова **параллельно** Task(qa) + Task(lenya). Макс 2 попытки.

## Почему параллельно только эти пары

| Параллельно | Почему безопасно |
|---------------|------------------|
| **Коля \|\| Артём** | Оба дают вход для Жени **независимо** (ядро и research). |
| **Алина \|\| Борис** | Разные блоки страницы; разные `id`; общий контекст handoff после Артура. |
| **Макс \|\| Лёня** | Оба проверяют **один и тот же** опубликованный URL; независимые отчёты. |

Важно: параллель безопасна только потому, что агенты пишут в **разные фрагменты**, а не одновременно в один handoff.

**Нельзя** распараллелить без риска: **Женя** (нужны оба входа Коли+Артём), **Артур** (нужен лонгрид), **Наташа** (нужны hero+Борис+текст), **Юра** (нужен финальный HTML от Наташи). Женя и Артур последовательно; Наташа и Юра — после визуальных блоков.

## Критичные промпты

- **Коле**: «ТОЛЬКО ядро. НЕ текст.»
- **Кириллу**: «Сам найди новость дня, проверь Wordstat и лидовый потенциал, выбери одну тему. НЕ текст.»
- **Артёму**: «Deep research 2026. НЕ текст.»
- **Жене**: «Лонгрид на основе данных Коли и Артёма.»
- **Артуру**: «Главный оффер — `${PRIMARY_CTA_URL}`, вторичный — `${SECONDARY_CTA_URL}` только уместно по смыслу, баннер — только из `AD_BANNER_*` по **skill advertiser-artur** (обязательны `alt` и `rel` у баннера).»
- **Алине**: «Только hero; CSS inline; светлый hero; новая сцена; чеклист отличий»
- **Борису**: «Не hero; блок в статье; **сплит или сетка + подпись**, не квадрат по центру; продолжение или контраст к Алине; свои id; якорь для Наташи»
- **Наташе**: «Hero Алины первым; вставь блок Бориса по handoff; не удаляй canvas/script (оба блока); реклама Артура; не затемняй hero; все `<img>` с **alt**; внешние `target="_blank"` с **rel="noopener noreferrer"**»
- **Юре**: «Инфраструктура берётся из env/secrets; хостинг и тема задаются при установке. Публикация только в **`${WP_THEME_SLUG}`**; перед выкладкой подтвердить `stylesheet/template`, после — проверить живой HTML на маркеры кастомного шаблона. НЕ WP API.»
- **Юре**: «Грузи в **активную тему**, потом проверь live HTML на **маркеры шаблона**; если в HTML дефолтный `page.php`, проверь `_wp_page_template` и кэш.»
- **Максу**: «Браузер: hero, блок Бориса (если есть), все canvas/script, контент, консоль; **нет img без alt**, ссылки-картинки с осмысленным доступным именем»
- **Лёне**: «Google + Yandex + GEO аудит. Только конкретные рекомендации на пересборку для Юры.»

## Запреты

- НЕ вызывай отдельный Task или команду с именем director — текущий агент уже Директор-оркестратор; director не является отдельной ролью пайплайна
- фоновый Task
- копирование лонгрида в чат до финала
