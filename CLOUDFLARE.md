# Деплой на Cloudflare Pages из GitHub

## 0. Репозиторий на GitHub

Сайт уже закоммичен локально. Осталось создать репозиторий и отправить код:

1. Откройте [github.com/new](https://github.com/new)
2. **Repository name:** `happy`
3. **Public**, без README / .gitignore / license
4. **Create repository**
5. В терминале в папке проекта выполните:

```bash
git remote add origin https://github.com/ВАШ_ЛОГИН/happy.git
git branch -M main
git push -u origin main
```

> Если `git remote add` пишет, что origin уже есть:  
> `git remote set-url origin https://github.com/ВАШ_ЛОГИН/happy.git`

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
