import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { TweetProvider } from './contexts/TweetContext.jsx';
import { TopicProvider } from './contexts/TopicContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <TweetProvider>
            <TopicProvider>
              <Router>
                <div className="App">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </main>
                </div>
              </Router>
            </TopicProvider>
          </TweetProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;