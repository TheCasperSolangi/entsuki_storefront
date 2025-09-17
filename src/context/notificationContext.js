// context/notificationContext.js
'use client';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { notificationReducer, initialState } from './notificationReducer';
import { NotificationService } from './notificationService';
import { NotificationWebSocket } from './notificationWebSocket';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, config }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [notificationService, setNotificationService] = React.useState(null);
  const [wsManager, setWsManager] = React.useState(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize service
  useEffect(() => {
    if (config?.apiUrl) {
      const service = new NotificationService(config.apiUrl);
      setNotificationService(service);
    }
  }, [config?.apiUrl]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchNotifications = useCallback(async (service) => {
    if (!service || !isInitialized) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await service.fetchNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isInitialized]);

  // Initialize notifications after service is ready
  useEffect(() => {
    if (!notificationService || isInitialized) return;
    
    const initializeNotifications = async () => {
      try {
        // Check if user is authenticated
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
          
        if (!token) {
          console.log('No auth token found, skipping notification initialization');
          setIsInitialized(true);
          return;
        }

        // Fetch initial notifications
        await fetchNotifications(notificationService);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        setIsInitialized(true);
      }
    };

    initializeNotifications();
  }, [notificationService, fetchNotifications, isInitialized]);

  // WebSocket handling
  useEffect(() => {
    if (!config || !notificationService || !isInitialized) return;

    let cleanup = null;

    const setupConnection = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
          
        if (!token) {
          console.log('No token found, skipping WebSocket setup');
          return;
        }

        if (config.enableWebSocket && config.wsUrl) {
          console.log('Setting up WebSocket connection...');
          
          const username = await notificationService.getUsername();
          console.log('Got username for WebSocket:', username);
          
          const ws = new NotificationWebSocket(
            config.wsUrl,
            dispatch,
            username,
            config.maxReconnectAttempts || 3
          );

          // Request notification permission
          await ws.requestNotificationPermission();
          
          // Connect WebSocket
          await ws.connect();
          setWsManager(ws);
          
          cleanup = () => {
            console.log('Cleaning up WebSocket connection');
            ws.disconnect();
            setWsManager(null);
          };
        } else {
          // Fallback to polling if WebSocket is disabled
          console.log('WebSocket disabled, using polling fallback');
          const interval = setInterval(() => {
            fetchNotifications(notificationService);
          }, config.pollInterval || 30000);
          
          cleanup = () => {
            console.log('Cleaning up polling interval');
            clearInterval(interval);
          };
        }
      } catch (error) {
        console.error('Failed to setup notification connection:', error);
      }
    };

    setupConnection();

    return () => {
      if (cleanup) cleanup();
    };
  }, [config, notificationService, isInitialized, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsManager) {
        wsManager.disconnect();
      }
    };
  }, [wsManager]);

  // Action handlers
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationService) return;
    
    try {
      await notificationService.markAsRead(notificationId);
      dispatch({ 
        type: 'MARK_AS_READ', 
        payload: notificationId 
      });
      
      // Emit to WebSocket if connected
      if (wsManager && wsManager.isConnected()) {
        wsManager.emit('mark_as_read', { notificationId });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [notificationService, wsManager]);

  const markAllAsRead = useCallback(async () => {
    if (!notificationService) return;
    
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
      
      // Emit to WebSocket if connected
      if (wsManager && wsManager.isConnected()) {
        wsManager.emit('mark_all_as_read', {});
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [notificationService, wsManager]);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!notificationService) return;
    
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch({ 
        type: 'DELETE_NOTIFICATION', 
        payload: notificationId 
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notificationService]);

  const refreshNotifications = useCallback(() => {
    if (notificationService && isInitialized) {
      fetchNotifications(notificationService);
    }
  }, [notificationService, isInitialized, fetchNotifications]);

  const value = React.useMemo(() => ({
    state,
    dispatch,
    service: notificationService,
    isInitialized,
    wsConnected: wsManager?.isConnected() || false,
    // Action handlers
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  }), [state, notificationService, isInitialized, wsManager, markAsRead, markAllAsRead, deleteNotification, refreshNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};