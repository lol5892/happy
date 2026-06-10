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

На сервере скопируйте `rsvp-config.example.php` → **`rsvp-config.php`**:

1. Создайте бота у [@BotFather](https://t.me/BotFather) → `/newbot`
2. Узнайте `chat_id`: напишите боту `/start`, откройте  
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates`
3. Вставьте токен и chat_id в `rsvp-config.php`

## Обновление сайта

После правок: `_build_gallery.py` → `_deploy.py` → залить изменённые файлы на Timeweb.

## Если что-то не работает

- **Галерея пустая** — запустите `_build_gallery.py`, затем `_deploy.py`
- **Фото не открываются** — проверьте права 755 на `assets/` и `photos/`
- **Домен не открывается** — проверьте A-запись и NS на Timeweb
- **RSVP не приходит** — проверьте `rsvp-config.php` и что вы написали боту `/start`
