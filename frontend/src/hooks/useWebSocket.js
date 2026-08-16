import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    if (!url) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${url}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, timeout);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const sendTyping = useCallback((isTyping) => {
    return sendMessage({ type: 'typing', is_typing: isTyping });
  }, [sendMessage]);

  const markRead = useCallback(() => {
    return sendMessage({ type: 'read' });
  }, [sendMessage]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    sendTyping,
    markRead,
  };
}
