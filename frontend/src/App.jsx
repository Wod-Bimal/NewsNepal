import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NewsProvider } from './contexts/NewsContext.jsx';
import { TopicProvider } from './contexts/TopicContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import About from './pages/About.jsx';
import Feed from './pages/Feed.jsx';
import NewsDetail from './pages/NewsDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import CreatePost from './pages/CreatePost.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <NewsProvider>
            <TopicProvider>
              <Router>
                <div className="App">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route 
                        path="/feed" 
                        element={
                          <ProtectedRoute>
                            <Feed />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/news/:id" element={<NewsDetail />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/create" 
                        element={
                          <ProtectedRoute>
                            <CreatePost />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </main>
                </div>
              </Router>
            </TopicProvider>
          </NewsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;