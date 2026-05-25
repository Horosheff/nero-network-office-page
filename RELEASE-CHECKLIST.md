# Release Checklist

Чеклист перед тем, как отдать Nero Network Office Page другому человеку или опубликовать на GitHub.

## 1. Проверка состава

- [ ] Есть `.cursor-plugin/plugin.json` с версией `0.2.0`.
- [ ] Есть все агенты: `director`, `kirill`, `seo-kolya`, `artyom`, `zhenya`, `artur`, `alina`, `boris`, `natasha`, `yura`, `qa`, `lenya`.
- [ ] Есть все skills, включая `director-nero-network` и `indexlift-seo-auditor`.
- [ ] Есть `README.md`, `INSTALL.md`, `SETUP.md`, `CLOUD-AUTOMATION.md`.
- [ ] Есть `.env.example`, `shared/hosting-credentials.env.example`, `shared/hosting-credentials.local.example`.
- [ ] Есть `scripts/check-config.py`.
- [ ] Есть тестовый WordPress-шаблон `wordpress/page-nero-network-office-example.php`.

## 2. Секреты и личные данные

- [ ] В репозитории нет `.env`.
- [ ] В репозитории нет `shared/hosting-credentials.local`.
- [ ] В репозитории нет приватных ключей: `*.pem`, `*.key`, `id_rsa*`, `id_ed25519*`.
- [ ] В репозитории нет `output/`, старых опубликованных страниц, audit deliverables и `node_modules/`.
- [ ] Поиск по старым доменам, логинам, партнёрским ссылкам и локальным путям ничего не находит.

Команды:

```powershell
git status --short
python .\scripts\check-config.py
```

Дополнительный поиск:

```powershell
rg -i "password|token|secret|api_key|ftp_host|ssh_host|C:\\Users|OLD_DOMAIN|OLD_BRAND|OLD_AFFILIATE" .
```

Совпадения с именами переменных в `.env.example` допустимы. Реальные значения недопустимы.

## 3. Локальная установка

- [ ] Папка подключена в `%USERPROFILE%\.cursor\plugins\local\nero-network-office-page`.
- [ ] Cursor перезагружен.
- [ ] Агенты и skills видны в Cursor.
- [ ] `shared/hosting-credentials.local` создан из `.example` и заполнен только локально.
- [ ] `python .\scripts\check-config.py --local` проходит базовую проверку.
- [ ] `python .\scripts\check-config.py --local --network` проходит сетевую проверку на машине, где есть доступ к сайту.

## 4. WordPress-проверка

- [ ] `WP_THEME_SLUG` совпадает с активной темой.
- [ ] FTP/SSH ведут в правильный WordPress.
- [ ] Тестовый шаблон `wordpress/page-nero-network-office-example.php` загружен в активную тему.
- [ ] В админке WordPress создана тестовая страница с шаблоном `Nero Network Office Example`.
- [ ] Страница открывается публично по HTTPS.

## 5. GitHub

- [ ] Сделан первый commit только после проверки секретов.
- [ ] Remote указывает на новый отдельный GitHub-репозиторий, не на старый проект.
- [ ] После push на GitHub проверена вкладка Files: секретов и локальных артефактов нет.
- [ ] В README указано, что реальные доступы хранятся только в env/secrets.

## 6. Передача пользователю

Передайте пользователю:

- ссылку на GitHub-репозиторий;
- `INSTALL.md`;
- список переменных из `.env.example`;
- предупреждение, что пароли нельзя отправлять в чат;
- команду проверки: `python scripts/check-config.py --local --network`.
