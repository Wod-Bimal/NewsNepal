# Backend Project Structure

This document provides a map to navigate the `newsNepal` Django backend.

## 📂 Project Root (`backend/`)

- **`manage.py`**: The command-line utility for administrative tasks (running server, migrations, creating users).
- **`db.sqlite3`**: The local development database.
- **`requirements.txt`**: List of Python dependencies.

---

## 🔧 Project Configuration (`backend/newsNepal/`)
This folder contains the core settings and configuration for the whole project.

- **`settings.py`**: Main configuration (database, apps, security, email, etc.).
- **`urls.py`**: The global URL router. It directs traffic to `tweets`, `accounts`, or the admin panel.
- **`wsgi.py` / `asgi.py`**: Entry points for web servers.

---

## 📦 Apps (Features)

The functionality is split into separate "Apps" to keep code organized.

### 1. 👤 Accounts App (`backend/accounts/`)
Manages user authentication and profiles.

- **`models.py`**: Defines the `User` model.
- **`serializers.py`**: specific API data formatting for Users (Login, Registration).
- **`views.py`**: API endpoints for Login, Register, Profile, Logout.
- **`urls.py`**: Routes for `api/auth/...`.
- **`admin.py`**: configuration for the Admin Panel view of Users.

### 2. 🐦 Tweets App (`backend/tweets/`)
Manages the core content: Tweets, Comments, Topics, Likes.

- **`models.py`**: Defines `Tweet`, `Topic`, `Comment` data structures.
- **`views.py`**: Logic for Creating, Reading, Updating, Deleting tweets/comments.
- **`serializers.py`**: Converts Model data to JSON for the frontend.
- **`urls.py`**: Routes for `api/tweets/...`, `api/topics/...`, etc.
- **`admin.py`**: configuration for the Admin Panel view of Tweets/Topics.

---

## 🧭 Common Commands

- **Run Server**: `python manage.py runserver`
- **Make Migrations** (after changing models): `python manage.py makemigrations`
- **Run Migrations**: `python manage.py migrate`
- **Create Admin User**: `python manage.py createsuperuser`
