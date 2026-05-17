import React, { createContext, useContext, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Notification = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'success': return '#ECFDF5';
      case 'error': return '#FDF2F8';
      case 'warning': return '#FFFBEB';
      case 'info': return '#EFF6FF';
      default: return '#F9FAFB';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#059669';
      case 'error': return '#E0245E';
      case 'warning': return '#D97706';
      case 'info': return '#1DA1F2';
      default: return '#374151';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#D1FAE5';
      case 'error': return '#FCE7F3';
      case 'warning': return '#FEF3C7';
      case 'info': return '#DBEAFE';
      default: return '#E5E7EB';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-in-out;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.h4`
  font-weight: 600;
  font-size: 14px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
`;

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification) {
        // Add exiting animation
        const updatedNotification = { ...notification, isExiting: true };
        const otherNotifications = prev.filter(n => n.id !== id);
        
        // Return with exiting notification for animation
        setTimeout(() => {
          setNotifications(otherNotifications);
        }, 300);
        
        return [...otherNotifications, updatedNotification];
      }
      return prev;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    return addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error') => {
    return addNotification({ type: 'error', title, message });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    return addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info') => {
    return addNotification({ type: 'info', title, message });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            isExiting={notification.isExiting}
          >
            <NotificationHeader>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <CloseButton onClick={() => removeNotification(notification.id)}>
                ×
              </CloseButton>
            </NotificationHeader>
            <NotificationMessage>{notification.message}</NotificationMessage>
          </Notification>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};