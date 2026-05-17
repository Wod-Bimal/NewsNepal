# NewsNepal Frontend

A modern React application for the NewsNepal political voice platform, built with React 18, styled-components, and modern React patterns.

## 🚀 Features

- **Modern React Architecture**: Built with React 18, hooks, and functional components
- **Styled Components**: CSS-in-JS styling with theme support
- **Context API**: Global state management for authentication, tweets, and notifications
- **React Router**: Client-side routing with protected routes
- **Custom Hooks**: Reusable logic for API calls and local storage
- **Error Boundaries**: Graceful error handling and recovery
- **Responsive Design**: Mobile-first design that works on all devices
- **Performance Optimized**: Code splitting and lazy loading ready

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.js
│   ├── Layout.js
│   ├── LoadingSpinner.js
│   ├── Navbar.js
│   ├── ProtectedRoute.js
│   ├── TweetCard.js
│   └── TweetForm.js
├── contexts/           # React Context providers
│   ├── AuthContext.js
│   ├── NotificationContext.js
│   ├── TopicContext.js
│   └── TweetContext.js
├── hooks/             # Custom React hooks
│   ├── useApi.js
│   └── useLocalStorage.js
├── pages/             # Page components
│   ├── Home.js
│   ├── Login.js
│   ├── Profile.js
│   └── Register.js
├── services/          # API service layer
│   └── api.js
├── utils/             # Utility functions
│   ├── constants.js
│   └── helpers.js
├── App.js             # Main app component
├── App.css            # Global styles
├── index.js           # App entry point
└── index.css          # Base styles
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration.

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎨 Styling

The app uses **styled-components** for styling with a consistent design system:

- **Colors**: Primary (#1DA1F2), Secondary (#E1E8ED), Success, Error, Warning
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-first breakpoints

## 🔧 Key Components

### Context Providers

- **AuthContext**: User authentication and profile management
- **TweetContext**: Tweet operations and state management
- **TopicContext**: Political topic management
- **NotificationContext**: Toast notifications and alerts

### Custom Hooks

- **useApi**: Generic API call hook with loading states
- **useLocalStorage**: Persistent local storage hook

### Services

- **api.js**: Centralized API service with axios configuration
- **constants.js**: App constants and configuration
- **helpers.js**: Utility functions for formatting and validation

## 🚀 Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use styled-components for styling
- Implement proper error handling
- Write meaningful component names

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔒 Security

- Protected routes for authenticated users
- Input validation and sanitization
- Secure API communication
- Error boundary for graceful failures

## 🧪 Testing

The app includes:
- Jest testing setup
- React Testing Library
- Component testing examples
- API mocking utilities

## 📦 Dependencies

### Core Dependencies
- **React 18.2.0** - UI library
- **React Router 6.8.1** - Routing
- **Styled Components 6.1.1** - CSS-in-JS
- **Axios 1.6.2** - HTTP client
- **React Icons 4.12.0** - Icon library

### Development Dependencies
- **React Scripts 5.0.1** - Build tools
- **Testing Library** - Testing utilities
- **Web Vitals** - Performance monitoring

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is part of the NewsNepal platform and follows the same licensing terms.