# Diplom — трекер личных финансов

Небольшой fullstack-проект для учёта личных денег: счета, категории, операции, бюджеты и немного аналитики на дашборде.

По стеку всё максимально практично: React + Vite на фронте и Express + MongoDB на бэкенде.

## Что здесь есть

- регистрация и вход по JWT
- работа со счетами (создание/редактирование)
- категории доходов и расходов
- операции с фильтрами и историей
- бюджеты и периодические операции
- дашборд с графиками и сводкой
- защита приватных роутов на клиенте и на API

## Стек

Frontend:
- React 18
- Vite
- React Router
- Redux Toolkit
- Recharts

Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs

## Быстрый старт

### 1) Установка зависимостей

```bash
npm install
```

### 2) Переменные окружения

Создайте `.env` на основе `.env.example`:

```env
JWT_SECRET=change_me_to_long_random_secret
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
```

Если `MONGO_URI` не задан, сервер запустится, но без подключения к базе.

### 3) Запуск

Фронтенд (Vite):

```bash
npm run dev
```

Бэкенд (Express):

```bash
npm run server
```

По умолчанию API поднимается на `http://localhost:3002`.

## Сборка

```bash
npm run build
npm start
```

`npm run build` собирает фронт в `build/`, а `npm start` поднимает Express и раздаёт статику из этой папки.

## Основные папки

- `src/` — клиентская часть
- `controllers/` — обработчики API
- `routes/` — роуты Express
- `models/` — Mongoose-модели
- `middleware/` — auth и SPA fallback
- `db/` — подключение к MongoDB
- `utils/` — утилиты сервера

## Пару слов про проект

Этот репозиторий сделан как дипломный pet-проект с упором на понятную структуру и рабочий CRUD-цикл по финансам. Код не идеален, но его легко расширять: добавлять новые сущности, отчёты и интеграции.
