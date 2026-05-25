---
description: Полная цепочка Кирилл → Коля||Артём → Женя → Артур → Алина||Борис → Наташа → Юра → Макс||Лёня.
---

Пайплайн **Кирилл → Коля||Артём → Женя → Артур → Алина||Борис → Наташа → Юра → Макс||Лёня**.

В Cursor Cloud текущий агент уже является Директором-оркестратором. Не вызывай отдельный Task или команду с именем director: каждая роль ниже запускается отдельным `Task(<role>)`, а если тип роли недоступен — отдельным `Task(generalPurpose)` с путём `agents/<role>.md` и соответствующим skill. Самому писать результат роли запрещено.

**Перед стартом:** Директор **обязан** сбросить `<PROJECT_ROOT>/.cursor/nero-network-handoff.md` через **Write** (полная перезапись одной строкой, например `# Nero Network — новая сессия`) и очистить фрагменты в `<PROJECT_ROOT>/.cursor/nero-network-fragments/`. Без сброса не запускать субагентов.

1. **Task(`kirill`)** — если нужна новость дня / актуальная тема / пользователь не дал точную тему: сам ищет свежий инфоповод, проверяет `<PROJECT_ROOT>/shared/kirill-news-ledger.md` и `<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md`, проверяет Wordstat, лидовый потенциал и выбирает одну тему
   - после Кирилла проверить маркер `=== КИРИЛЛ (НОВОСТЬ ДНЯ) ===`
   - проверить, что Кирилл записал победителя в `<PROJECT_ROOT>/shared/kirill-news-ledger.md` со статусом `selected`
2. **Task(`seo-kolya`) + Task(`artyom`) параллельно** — ядро Wordstat + deep research 2026 по теме пользователя или победителю Кирилла
   - параллельные агенты пишут только во фрагменты `.cursor\nero-network-fragments\kolya.md` и `.cursor\nero-network-fragments\artyom.md`
   - Директор сам переносит оба фрагмента в handoff и проверяет маркеры `=== КОЛЯ (SEO-ЯДРО) ===` и `=== АРТЁМ (RESEARCH) ===`
3. **Task(`zhenya`)** — лонгрид на основе данных Коли, Артёма и при наличии Кирилла
4. **Task(`artur`)** — добавляет рекламные блоки и CTA
5. **Task(`alina`) + Task(`boris`) параллельно** — hero Canvas + визуальный блок в теле статьи
   - параллельные агенты пишут только во фрагменты `.cursor\nero-network-fragments\alina.md` и `.cursor\nero-network-fragments\boris.md`
   - Директор сам переносит оба фрагмента в handoff и проверяет маркеры `=== АЛИНА (HERO) ===` и `=== БОРИС (БЛОК СТАТЬИ, НЕ HERO) ===`
6. **Task(`natasha`)** — полная вёрстка страницы: hero → введение → контент → Борис → CTA/FAQ
7. **Task(`yura`)** — SSH/SCP/SFTP/FTP → `page-{slug}.php` в фиксированную тему `${WP_THEME_SLUG}`; НЕ WordPress API; после публикации обновляет `<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md` и, если тема от Кирилла, `<PROJECT_ROOT>/shared/kirill-news-ledger.md` статусом `published`; Директор проверяет блок `=== ЮРА (ПУБЛИКАЦИЯ) ===` до QA
8. **Task(`qa`) + Task(`lenya`) параллельно** — QA в браузере + Google/Yandex/GEO аудит; пишут только во фрагменты `.cursor\nero-network-fragments\qa.md` и `.cursor\nero-network-fragments\lenya.md`, Директор переносит в handoff без дублей
9. Если Макс или Лёня находят проблемы → Task(`yura`) пересобирает → Макс и Лёня снова (макс 2 попытки)

**Передай:** тему; при необходимости — «только SEO», «только ядро» или «без публикации».
