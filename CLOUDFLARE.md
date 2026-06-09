# Деплой на Cloudflare Pages из GitHub

## 1. Подключить репозиторий

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Выберите репозиторий **happy**
3. Настройки сборки:
   - **Framework preset:** None
   - **Build command:** *(оставить пустым)*
   - **Build output directory:** `/`
4. **Save and Deploy**

## 2. Telegram-уведомления (RSVP)

В проекте Pages → **Settings** → **Environment variables** добавьте:

| Переменная | Значение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен от @BotFather |
| `TELEGRAM_CHAT_IDS` | chat_id через запятую, например `123456789,987654321` |

Для Production и Preview можно указать одинаковые значения.

Как получить `chat_id`: напишите боту `/start`, откройте  
`https://api.telegram.org/bot<ТОКЕН>/getUpdates`

## 3. Готовая ссылка

После деплоя сайт будет по адресу:

`https://happy.pages.dev` (или ваше имя проекта)

Эту ссылку отправляйте гостям.

## 4. Обновление сайта

Любой `git push` в GitHub — Cloudflare автоматически пересоберёт сайт за 1–2 минуты.
