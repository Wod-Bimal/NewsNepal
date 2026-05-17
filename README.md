# NewsNepal - Political Voice Platform

A Twitter-like social media platform designed specifically for Nepali people to voice their political concerns and engage in political discussions.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Tweet System**: Post tweets with text and images
- **Topic Categorization**: Organize tweets by political topics
- **Social Interactions**: Like, retweet, and comment on tweets
- **Search Functionality**: Search through tweets and users
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend (Django)
- Django 4.2.7
- Django REST Framework
- SQLite database
- CORS support for frontend integration

### Frontend (React)
- React 18.2.0
- React Router for navigation
- Styled Components for styling
- Axios for API calls

## Project Structure

```
newsNepal/
├── backend/                 # Django backend
│   ├── newsNepal/         # Main Django project
│   ├── accounts/          # User authentication app
│   ├── tweets/           # Tweet management app
│   ├── requirements.txt  # Python dependencies
│   └── manage.py         # Django management script
├── frontend/              # React frontend
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   └── App.js        # Main app component
│   └── package.json      # Node.js dependencies
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create environment file:
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your settings.

6. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

8. Start the Django server:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update user profile

### Tweets
- `GET /api/tweets/` - Get all tweets
- `POST /api/tweets/create/` - Create a new tweet
- `GET /api/tweets/{id}/` - Get specific tweet
- `DELETE /api/tweets/{id}/delete/` - Delete tweet
- `POST /api/tweets/{id}/like/` - Like/unlike tweet
- `POST /api/tweets/{id}/retweet/` - Retweet/unretweet

### Topics
- `GET /api/topics/` - Get all topics

## Usage

1. **Registration**: Create an account with username, email, and password
2. **Login**: Sign in to your account
3. **Post Tweets**: Share your political thoughts with optional images
4. **Browse Topics**: Filter tweets by political topics
5. **Interact**: Like, retweet, and comment on tweets
6. **Search**: Find tweets and users using the search functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.