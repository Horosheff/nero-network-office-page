# Схема агентов Nero Network Office Page

Это карта “офиса”: кто за что отвечает, какие роли можно запускать параллельно, где лежит handoff и какие настройки нужны для переноса плагина на другой WordPress-сайт.

## Архитектура

```mermaid
flowchart TB
  subgraph Input[Вход]
    TOPIC[Тема пользователя]
    NEWS[Новость дня]
    ENV[Env / Secrets сайта]
  end

  subgraph Strategy[Стратегия]
    D[Директор]
    K[Кирилл]
  end

  subgraph Intelligence[Семантика и фактура]
    KO[Коля<br/>SEO + Wordstat]
    A[Артём<br/>Research]
  end

  subgraph Content[Контент]
    Z[Женя<br/>Лонгрид]
    AR[Артур<br/>CTA + реклама]
  end

  subgraph Visual[Визуал]
    AL[Алина<br/>Hero]
    B[Борис<br/>Визуальный блок]
    N[Наташа<br/>Финальная страница]
  end

  subgraph Publish[Публикация и контроль]
    Y[Юра<br/>FTP / SSH / WordPress]
    Q[Макс<br/>Browser QA]
    L[Лёня<br/>SEO-аудит]
  end

  TOPIC --> D
  NEWS --> K --> D
  ENV --> AR
  ENV --> Y
  D --> KO
  D --> A
  KO --> Z
  A --> Z
  Z --> AR
  AR --> AL
  AR --> B
  AL --> N
  B --> N
  N --> Y
  Y --> Q
  Y --> L
  Q --> D
  L --> D
```

## Пайплайн по шагам

```mermaid
sequenceDiagram
  participant U as Пользователь
  participant D as Директор
  participant K as Кирилл
  participant KO as Коля
  participant A as Артём
  participant Z as Женя
  participant AR as Артур
  participant AL as Алина
  participant B as Борис
  participant N as Наташа
  participant Y as Юра
  participant Q as Макс
  participant L as Лёня

  U->>D: Тема страницы или запрос новости дня
  D->>K: Найти/проверить тему
  K-->>D: Инфоповод, спрос, дубли
  par Семантика
    D->>KO: SEO-ядро и структура
    KO-->>D: kolya.md
  and Research
    D->>A: Факты, источники, конкуренты
    A-->>D: artyom.md
  end
  D->>Z: Лонгрид по ядру и research
  Z-->>D: Полный текст
  D->>AR: CTA из env/secrets
  AR-->>D: Рекламные вставки
  par Hero
    D->>AL: Hero-секция
    AL-->>D: alina.md
  and Visual block
    D->>B: Блок в теле статьи
    B-->>D: boris.md
  end
  D->>N: Собрать страницу
  N-->>D: HTML/PHP
  D->>Y: Опубликовать через FTP/SSH
  Y-->>D: URL и отчёт публикации
  par QA
    D->>Q: Проверка браузером
    Q-->>D: qa.md
  and SEO audit
    D->>L: SEO/GEO-аудит
    L-->>D: lenya.md
  end
  D-->>U: URL или список исправлений
```

## Матрица ролей

| Роль | Агент | Skill | Вход | Выход |
| --- | --- | --- | --- | --- |
| Оркестратор | `director` | `director-nero-network` | ТЗ пользователя, handoff, фрагменты | Управляемый пайплайн |
| Разведчик темы | `kirill` | `news-scout-kirill` | Тема или запрос новости дня | Инфоповод, спрос, дубли |
| SEO-семантик | `seo-kolya` | `seo-agent-kolya` | Тема | Ядро, мета, структура |
| Исследователь | `artyom` | `researcher-artyom` | Тема | Факты, источники, конкуренты |
| Копирайтер | `zhenya` | `seo-writer-zhenya` | SEO + research | Лонгрид |
| Рекламщик | `artur` | `advertiser-artur` | Лонгрид + env CTA | CTA и рекламные блоки |
| Hero-аниматор | `alina` | `animator-alina` | Тема + текст + CTA | Hero-секция |
| Визуальный редактор | `boris` | `animator-boris` | Тема + текст | Блок в теле статьи |
| Дизайнер страницы | `natasha` | `designer-natasha` | Текст + hero + блок Бориса | Финальная страница |
| Публикатор | `yura` | `publisher-yura` | HTML/PHP + env доступы | Живая WP-страница |
| QA | `qa` | `qa-checker` | URL | Browser QA |
| SEO-аудитор | `lenya` | `seo-auditor-lenya` | URL | Google/Yandex/GEO-аудит |

## Параллельные блоки

```mermaid
flowchart LR
  subgraph P1[Параллель 1: вход для текста]
    KO[Коля: SEO]
    A[Артём: Research]
  end

  subgraph P2[Параллель 2: визуал]
    AL[Алина: Hero]
    B[Борис: Article visual]
  end

  subgraph P3[Параллель 3: финальный контроль]
    Q[Макс: QA]
    L[Лёня: SEO-аудит]
  end

  P1 --> Z[Женя]
  Z --> AR[Артур]
  AR --> P2
  P2 --> N[Наташа]
  N --> Y[Юра]
  Y --> P3
```

Параллель безопасна только потому, что роли пишут в разные фрагменты, а не в один общий файл.

## Handoff

```mermaid
flowchart TB
  D[Директор] --> RESET[Сброс handoff перед новой задачей]
  RESET --> H[.cursor/nero-network-handoff.md]

  subgraph Frag[.cursor/nero-network-fragments/]
    F1[kolya.md]
    F2[artyom.md]
    F3[alina.md]
    F4[boris.md]
    F5[qa.md]
    F6[lenya.md]
  end

  F1 --> MERGE[Склейка директором]
  F2 --> MERGE
  F3 --> MERGE
  F4 --> MERGE
  F5 --> MERGE
  F6 --> MERGE
  MERGE --> H
  H --> CHECK[Проверка маркеров и дублей]
```

Итоговый файл:

`<PROJECT_ROOT>/.cursor/nero-network-handoff.md`

Фрагменты:

`<PROJECT_ROOT>/.cursor/nero-network-fragments/`

Ожидаемые фрагменты:

- `kolya.md`
- `artyom.md`
- `alina.md`
- `boris.md`
- `qa.md`
- `lenya.md`

## Конфигурация сайта

```mermaid
flowchart LR
  EX[.env.example] --> ENV[.env]
  LOCEX[hosting-credentials.local.example] --> LOCAL[hosting-credentials.local]
  CLOUD[Cursor Cloud Secrets] --> RUNTIME[Runtime env]
  ENV --> RUNTIME
  LOCAL --> RUNTIME
  RUNTIME --> Y[Юра]
  RUNTIME --> AR[Артур]
  RUNTIME --> CHECK[scripts/check-config.py]
```

Обязательные переменные:

- `SITE_BRAND`
- `SITE_NICHE`
- `WP_SITE_URL`
- `PUBLIC_SITE_URL`
- `WP_THEME_SLUG`
- `REMOTE_SITE_ROOT`
- `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
- `SSH_HOST`, `SSH_USER`, `SSH_PASSWORD`

Опциональные переменные:

- `PRIMARY_CTA_LABEL`, `PRIMARY_CTA_URL`
- `SECONDARY_CTA_LABEL`, `SECONDARY_CTA_URL`
- `AD_BANNER_URL`, `AD_BANNER_IMAGE_URL`, `AD_BANNER_ALT`

Проверка:

```powershell
python scripts/check-config.py --local
python scripts/check-config.py --local --network
```

## WordPress lifecycle

```mermaid
flowchart TB
  HTML[HTML/PHP от Наташи] --> THEME[Активная WP-тема]
  THEME --> FTP[FTP/SFTP upload]
  FTP --> WPCLI[WP-CLI / SSH настройка страницы]
  WPCLI --> LIVE[Публичный URL]
  LIVE --> QA[QA браузером]
  LIVE --> SEO[SEO/GEO-аудит]
  QA --> FIX{Есть ошибки?}
  SEO --> FIX
  FIX -- да --> Y[Юра исправляет]
  Y --> LIVE
  FIX -- нет --> DONE[Готово]
```

Ключевое правило: страницы с `<script>` и `<canvas>` публикуются через PHP-шаблон в теме, а не через WordPress REST API.

## Безопасность

```mermaid
flowchart TB
  SECRET[Пароли, ключи, домены, CTA] --> PRIVATE[.env / local / Cloud Secrets]
  PRIVATE --> AGENTS[Агенты используют значения]
  REPO[GitHub repository] --> PUBLIC[Только шаблоны и инструкции]
  SECRET -. запрещено .-> REPO
```

Нельзя коммитить:

- `.env`
- `shared/hosting-credentials.local`
- приватные ключи;
- `node_modules`;
- `deliverables`;
- `output`;
- одноразовые публикационные PHP/FTP/SSH-скрипты.

## Первый запуск

1. Установить плагин в Cursor.
2. Скопировать `shared/hosting-credentials.local.example` в `shared/hosting-credentials.local`.
3. Заполнить переменные сайта.
4. Выполнить `python scripts/check-config.py --local`.
5. Выполнить `python scripts/check-config.py --local --network`.
6. Проверить шаблон `wordpress/page-nero-network-office-example.php`.
7. Запустить задачу в Cursor:

```text
Создай WordPress-страницу через Nero Network Office Page по теме: <тема>
```
