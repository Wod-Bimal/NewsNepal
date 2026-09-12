# NewsNepal 🇳🇵

A news sharing app for Nepalese people with **source transparency** and **bias detection** — plus real-time messaging and discussions.

Instead of just another news feed, NewsNepal shows **who wrote it, which outlet published it, and how biased that outlet leans**, so readers can make up their own minds.

## ✨ Features

- 📰 **News feed** — share posts, like, comment, and follow authors
- ⚖️ **Bias detection** — outlets rated `center / left / right / extreme / sensationalist`, with community bias voting on posts
- 🔗 **Source transparency** — every story shows its original NewsSource, credibility score, and link
- 💬 **Real-time messaging** — 1:1 DMs, group chats, and per-article discussion threads (WebSockets via Django Channels / Daphne)
- 🔔 **Notifications** — likes, comments, follows, new posts, and messages delivered live
- 👤 **Profiles** — follow system, followers/following, user stats and activity feeds

## 🛠️ Tech Stack

| Layer    | Tech |
|----------|------|
| Backend  | Django 4.2, DRF, Django Channels, SQLite |
| Frontend | React 18, Vite, styled-components, React Router |
| Realtime | WebSockets (Daphne for ASGI) |
| Auth     | Session-based with CSRF cookies |

## 🚀 Getting Started

### Backend

```bash
cd backend
D:\newsNepal\.venv\Scripts\python manage.py migrate
D:\newsNepal\.venv\Scripts\python manage.py runserver
# WebSocket support (DMs, threads, notifications):
daphne newsNepal.asgi:application --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start        # http://localhost:5173
```

The Vite dev server proxies `/api`, `/ws`, `/admin`, and `/media` to `localhost:8000`.

## 📦 Project Structure

```
backend/
  accounts/      # custom user model, follow system, profiles
  tweets/        # news posts, comments, likes, bias votes, sources
  messaging/     # DMs, group chats, article discussion threads
  notifications/ # real-time notifications (WS + REST)
  newsNepal/     # project settings, URL routing, ASGI
frontend/
  src/
    components/  # UI (Navbar, NotificationsBell, chat, news cards...)
    contexts/    # Auth, Notifications providers
    pages/       # Dashboard, Feed, Messages, Profiles, NewsDetail...
    hooks/       # useWebSocket, useDocumentTitle
    services/    # API client (axios) + service modules
```

## 🧭 API Highlights

- `POST /api/news/{id}/bias/` — vote on a post's bias (`{ "rating": "left" }`)
- `POST /api/news/{id}/comments/` — comment on a story
- `/api/conversations/` — create list of conversations (1:1 or group)
- `POST /api/notifications/{id}/read/` — mark a notification read
- WS: `/ws/chat/{conversation_id}/`, `/ws/thread/{news_id}/`, `/ws/notifications/`

## 🔒 Security Notes

- Session-based auth with CSRF tokens (`X-CSRFToken` header, `withCredentials`)
- Secrets live in `.env` — never commit them
- Only users who follow each other can start 1:1 DMs
- No self-notifications

## 📝 License

Add your license here (e.g. MIT).