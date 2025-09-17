// hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';

export function useWebSocket({ 
  onNotification, 
  onNotificationUpdate, 
  onNotificationDelete 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      // Adjust WebSocket URL based on your server setup
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://your-domain.com/ws'
        : 'ws://localhost:3001/ws';
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send authentication if needed
        const token = localStorage.getItem('authToken'); // Adjust based on your auth
        if (token) {
          ws.current.send(JSON.stringify({
            type: 'authenticate',
            token
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'new_notification':
              onNotification && onNotification(data.notification);
              break;
            case 'notification_updated':
              onNotificationUpdate && onNotificationUpdate(data.update);
              break;
            case 'notification_deleted':
              onNotificationDelete && onNotificationDelete(data.notificationId);
              break;
            case 'authenticated':
              console.log('WebSocket authenticated');
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        attemptReconnect();
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      attemptReconnect();
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
      console.log(`Attempting to reconnect in ${delay}ms...`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current++;
        connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close();
    }
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - you might want to reduce activity
      } else {
        // Page is visible - ensure connection is active
        if (!isConnected && ws.current?.readyState !== WebSocket.CONNECTING) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected]);

  return {
    isConnected,
    disconnect
  };
}