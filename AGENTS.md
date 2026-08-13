# AGENTS.md

## Project Overview
NewsNepal — a news sharing app for Nepalese people with source transparency and bias detection. React (Vite) frontend + Django REST Framework backend.

## Commands
### Backend (D:\newsNepal\backend)
- Run server: `..\.venv\Scripts\python manage.py runserver` (port 8000)
- Check: `..\.venv\Scripts\python manage.py check`
- Migrations: `..\.venv\Scripts\python manage.py makemigrations` / `migrate`
- Python venv: `D:\newsNepal\.venv\`

### Frontend (D:\newsNepal\frontend)
- Run dev: `npm start` (Vite, port 5173)
- Build: `npm run build`
- Lint: `npm run lint` (eslint src/)
- Test: `npm test` (vitest)

## Architecture
- **Backend**: Django 4.2 + DRF, SQLite. Apps: `tweets`, `accounts`.
- **Frontend**: React 18, styled-components, react-router-dom, axios.
- **Ports**: Backend 8000, frontend 5173. Vite proxies `/api` → `localhost:8000`.

## Key Conventions
- **API calls** go through the Vite proxy — `API_BASE_URL` in `frontend/src/utils/constants.js` must stay empty (''). Do NOT hardcode `http://localhost:8000` as baseURL.
- **DRF pagination**: endpoints return `{ count, results: [...] }`. Always extract `response.data.results || response.data`.
- **styled-components v6**: transient props require `$` prefix (e.g. `$active`), never plain `active` (causes React DOM warnings).
- **User model** field is `profile_picture` (NOT `avatar`). Also `username`, `email`, `first_name`, `last_name`, `bio`, `location`, `birth_date`, `created_at`, `is_staff`, `is_superuser`.
- **Comments** endpoints live under news: `/api/news/{newsId}/comments/`. Do NOT use `/api/comments/create/`.
- **Auth**: session-based (cookies), `withCredentials: true`, CSRF token read from cookie via `X-CSRFToken` header.
- **Bias voting**: `POST/DELETE /api/news/{id}/bias/` with `{ rating }`.

## Models
- `tweets.News`: author FK, title, summary, content, topic FK, source FK (NewsSource), source_url, image, likes M2M (related_name `liked_news`), shares M2M, `bias_summary` computed property.
- `tweets.Comment`: news FK, author FK, content, likes M2M.
- `tweets.NewsSource`: name, website_url, logo, bias_rating, credibility_score, country, description, is_active.
- `tweets.BiasVote`: news + user unique together, rating.
- `accounts.User`: custom user model.
- `tweets.Topic`: name, description, color.

## Bias Ratings
`center`, `left`, `right`, `left_extreme`, `right_extreme`, `sensationalist`, `unknown` — colors in `BIAS_CONFIG` in constants.js.

## Admin Credentials (dev)
- admin / admin123 (superuser)
- newsreporter / reporter123

## Testing
No automated backend test suite configured; verify with `manage.py check` + manual API testing. Frontend tests via vitest.

## Security
Never commit secrets. `.env` for Django secrets (python-decouple). Do not log passwords or tokens.
