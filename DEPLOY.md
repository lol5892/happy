# Выкладка на Timeweb

## Сборка

```bash
python _build_gallery.py
python _deploy.py
```

Появятся папка **`dist/`** и архив **`happy-site.zip`** (~200 МБ).

## Загрузка

1. [hosting.timeweb.ru/fileman](https://hosting.timeweb.ru/fileman) → **`public_html`**
2. Удалите стандартный `index.html`, если есть.
3. Загрузите и распакуйте **`happy-site.zip`** в корень `public_html`.
4. Права на папки **`assets`** и **`photos`** → **755**.

В корне должны лежать: `index.html`, `styles.css`, `script.js`, `assets/`, `photos/`.

## DNS

- **NS:** Timeweb (`ns1.timeweb.ru`, `ns2.timeweb.ru`, …)
- **A-запись:** `@` → IP сервера (например `92.53.96.223`)

## RSVP (Telegram)

### Cloudflare Pages (основной способ)

**Если бот уже есть** — нового создавать не нужно. Сайт просто шлёт RSVP через `sendMessage` вашему боту.

1. Откройте [@BotFather](https://t.me/BotFather) → `/mybots` → выберите бота → **API Token** → скопируйте **токен**.
2. Напишите боту `/start` с каждого аккаунта, куда должны приходить уведомления (или добавьте бота в группу и напишите там).
3. Узнайте **chat_id**: откройте  
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates`  
   и найдите `"chat":{"id":123456789}`.  
   Для группы id будет отрицательным, например `-1001234567890`.
4. Cloudflare → **Workers & Pages** → проект **happy** → **Settings** → **Environment variables**:
   - `TELEGRAM_BOT_TOKEN` — токен вашего бота
   - `TELEGRAM_CHAT_IDS` — chat_id через запятую, например `123456789,987654321`
5. Добавьте для **Production** (и Preview, если нужно) → **Save**.
6. **Deployments** → **Retry deployment** (после первого сохранения переменных).

Проверка: отправьте форму на сайте — в Telegram должно прийти сообщение.

### Timeweb (PHP)

На сервере скопируйте `rsvp-config.example.php` → **`rsvp-config.php`** и вставьте токен и chat_id (см. шаги 1–3 выше).

> На Timeweb в `_deploy.py` сборка подменяет endpoint на `rsvp.php`.

## Обновление сайта

После правок: `_build_gallery.py` → `_deploy.py` → залить изменённые файлы на Timeweb.

## Если что-то не работает

- **Галерея пустая** — запустите `_build_gallery.py`, затем `_deploy.py`
- **Фото не открываются** — проверьте права 755 на `assets/` и `photos/`
- **Домен не открывается** — проверьте A-запись и NS на Timeweb
- **RSVP не приходит (Cloudflare)** — проверьте переменные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_IDS`, что вы написали боту `/start`, и перезапустите деплой
- **RSVP не приходит (Timeweb)** — проверьте `rsvp-config.php` и что вы написали боту `/start`
