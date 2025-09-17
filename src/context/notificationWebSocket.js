// context/notificationWebSocket.js
import Cookies from 'js-cookie';

export class NotificationWebSocket {
  constructor(baseUrl, dispatch, username, maxReconnectAttempts = 3) {
    this.baseUrl = baseUrl;
    this.dispatch = dispatch;
    this.username = username;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.reconnectTimeout = null;
    this.isConnecting = false;
    this.isDestroyed = false;
  }

  async connect() {
    if (this.isConnecting || this.isDestroyed) return;
    
    const token = Cookies.get('token');
    if (!token) {
      console.error('No token found for WebSocket connection');
      return;
    }

    this.isConnecting = true;

    try {
      // Dynamic import for socket.io-client to prevent SSR issues
      const { io } = await import('socket.io-client');
      
      if (this.isDestroyed) return;

      console.log('Attempting WebSocket connection to:', this.baseUrl);
      
      this.socket = io(this.baseUrl, {
        auth: { 
          token,
          username: this.username 
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // We'll handle reconnection manually
        forceNew: true // Force a new connection
      });

      this.setupEventListeners();
      this.isConnecting = false;
    } catch (error) {
      console.error('Failed to import socket.io-client or create connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      // Join user-specific room
      if (this.username) {
        console.log('Joining room for user:', this.username);
        this.socket.emit('join', { username: this.username });
      }
    });

    // Listen for new notifications
    this.socket.on('notification', (notification) => {
      try {
        console.log('Received real-time notification:', notification);
        
        // Validate notification structure
        if (notification && (notification.notification_id || notification._id)) {
          // Normalize notification structure
          const normalizedNotification = {
            ...notification,
            notification_id: notification.notification_id || notification._id,
            is_read: Boolean(notification.is_read),
            created_at: notification.created_at || notification.createdAt || new Date().toISOString()
          };
          
          this.dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: normalizedNotification 
          });

          // Show browser notification if permission is granted
          this.showBrowserNotification(normalizedNotification);
        } else {
          console.warn('Invalid notification received:', notification);
        }
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    });

    // Listen for notification updates (mark as read, etc.)
    this.socket.on('notification_updated', (data) => {
      console.log('Notification updated:', data);
      this.dispatch({
        type: 'UPDATE_NOTIFICATION',
        payload: data
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('WebSocket disconnected:', reason);
      
      // Don't reconnect if disconnection was intentional
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle authentication errors
    this.socket.on('unauthorized', (error) => {
      console.error('WebSocket authentication failed:', error);
      // Clear the token and don't attempt to reconnect
      Cookies.remove('token');
      this.disconnect();
    });

    // Handle room join confirmation
    this.socket.on('joined', (data) => {
      console.log('Successfully joined room:', data);
    });
  }

  showBrowserNotification(notification) {
    // Check if browser notifications are supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.notification_title || notification.title, {
          body: notification.notification_text || notification.message,
          icon: '/favicon.ico', // Add your app icon path
          tag: notification.notification_id || notification._id,
          requireInteraction: false
        });
      } catch (error) {
        console.error('Failed to show browser notification:', error);
      }
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission;
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return 'denied';
      }
    }
    return Notification.permission;
  }

  handleReconnect() {
    if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max WebSocket reconnection attempts reached');
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(2000 * this.reconnectAttempts, 10000); // Max 10 seconds
    
    console.log(`WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    this.isDestroyed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = false;
    console.log('WebSocket disconnected and cleaned up');
  }

  // Method to send data through WebSocket
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}