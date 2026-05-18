---
description: Поставить задачу публикатору Юре — выкладка страницы/шаблона в тему WordPress на хостинг (доступы через env/secrets, локально fallback в shared/hosting-credentials.local)
---

Ответ и шаги — **на русском**. Секреты **не** дублируй в чат. В Cloud используй env/secrets; локально можно fallback в **`shared/hosting-credentials.local`**. Поля см. **`shared/HOSTING-CREDENTIALS-README.md`** и **`shared/hosting-credentials.env.example`**.

Скилл: **publisher-yura**. Субагент: **yura**. Публикация только через **FTP → `page-{slug}.php`** в фиксированную активную тему **`${WP_THEME_SLUG}`**. Для страниц с `<script>`/`<canvas>` **НЕ использовать WordPress API / REST API / MCP KV blob flow**.

После выкладки Юра проверяет не только HTTPS/200, но и live HTML: `main#primary`, `{slug}-page`, hero/canvas-маркеры, непустой meta description. Затем пишет URL в **`<PROJECT_ROOT>/nero-network-office-page/shared/published-pages.md`** и блок `=== ЮРА (ПУБЛИКАЦИЯ) ===`.

Если страница пришла из блока `=== КИРИЛЛ (НОВОСТЬ ДНЯ) ===`, Юра также обновляет **`<PROJECT_ROOT>/shared/kirill-news-ledger.md`**: добавляет строку `published` с публичным URL, чтобы Кирилл не выбрал эту новость повторно при следующих запусках.

Запрос:

- Что выкладываем (путь к файлам / фрагмент от Наташи):
- Имя шаблона WordPress (`page-….php`) или тип публикации:
- Slug страницы на сайте (если уже есть):
- Способ: FTP / SSH/SFTP фоллбэк (REST API / MCP KV запрещены для контента со скриптами):
- Подтверждение записи на прод (да/нет):
