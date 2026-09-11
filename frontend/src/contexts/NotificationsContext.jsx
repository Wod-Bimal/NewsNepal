import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { notificationService } from '../services/api.js';

const NotificationsContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wsUrl = user ? '/ws/notifications/' : null;
  const { isConnected, lastMessage } = useWebSocket(wsUrl);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ page_size: 30 });
      const list = res.data.results || res.data || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.is_read).length);
    } catch {
      // keep existing state on failure
    }
    setLoading(false);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Polling fallback (covers WS being unavailable, e.g. plain runserver)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Real-time WS push
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'notification') return;
    const n = lastMessage.notification;
    if (!n) return;
    setNotifications(prev => {
      if (prev.some(x => x.id === n.id)) return prev;
      return [n, ...prev];
    });
    setUnreadCount(prev => prev + 1);
  }, [lastMessage]);

  const markRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount(prev => Math.max(prev - 1, 0));
    try {
      const res = await notificationService.markRead(id);
      if (res.data) {
        setNotifications(prev => prev.map(n => (n.id === id ? res.data : n)));
      }
    } catch {
      // restore count could drift; refetch
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      const res = await notificationService.markAllRead();
      setUnreadCount(res.data?.unread_count ?? 0);
    } catch {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  const openPanel = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) fetchNotifications();
      return next;
    });
  }, [fetchNotifications]);

  const closePanel = useCallback(() => setIsOpen(false), []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        loading,
        isConnected,
        openPanel,
        closePanel,
        fetchNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};