# Приглашение на 1 годик Мирона

Сайт-приглашение: **miroshegodik.ru**

## Локальный просмотр

Откройте `index.html` в браузере (галерея работает через встроенный JSON).

## Структура

```
index.html, styles.css, script.js   — сайт
assets/photos/                      — фото истории, семьи, героя
photos/                             — фото галереи (исходники)
rsvp.php                            — RSVP на хостинге (Telegram)
_build_gallery.py                   — обновить галерею после добавления фото
_deploy.py                          — собрать dist/ и happy-site.zip
```

## Выкладка на Timeweb

```bash
python _build_gallery.py
python _deploy.py
```

Загрузите содержимое `dist/` или `happy-site.zip` в `public_html` на Timeweb.  
Подробности — в `DEPLOY.md`.
