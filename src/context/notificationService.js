// context/notificationService.js
import Cookies from 'js-cookie';

export class NotificationService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.username = null;
    this.authHeaders = null;
    this.isAuthenticating = false;
  }

  async getAuthHeaders() {
    // Return cached headers if available and still valid
    if (this.authHeaders) {
      return this.authHeaders;
    }

    const token = Cookies.get('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    this.authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    return this.authHeaders;
  }

  async getUsername() {
    if (this.username) {
      return this.username;
    }

    // Prevent multiple simultaneous authentication requests
    if (this.isAuthenticating) {
      return new Promise((resolve, reject) => {
        const checkAuth = () => {
          if (!this.isAuthenticating) {
            if (this.username) {
              resolve(this.username);
            } else {
              reject(new Error('Authentication failed'));
            }
          } else {
            setTimeout(checkAuth, 100);
          }
        };
        checkAuth();
      });
    }

    this.isAuthenticating = true;

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`http://localhost:5000/api/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          Cookies.remove('token');
          this.authHeaders = null;
        }
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.username = data.username || data.user?.username;
      
      if (!this.username) {
        throw new Error('Username not found in response');
      }

      return this.username;
    } catch (error) {
      console.error('Error getting username:', error);
      // Clear cached data on error
      this.username = null;
      this.authHeaders = null;
      throw error;
    } finally {
      this.isAuthenticating = false;
    }
  }

  async fetchNotifications() {
    try {
      const headers = await this.getAuthHeaders();
      const username = await this.getUsername();
      
      const response = await fetch(`http://localhost:5000/api/notifications/user/${username}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid auth data
          this.clearAuthCache();
          throw new Error('Authentication expired');
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let notifications = [];
      if (Array.isArray(data)) {
        notifications = data;
      } else if (data.success && Array.isArray(data.data)) {
        notifications = data.data;
      } else if (data.notifications && Array.isArray(data.notifications)) {
        notifications = data.notifications;
      }

      // Ensure each notification has required fields and normalize structure
      return notifications.map(notification => ({
        ...notification,
        notification_id: notification.notification_id || notification._id,
        is_read: Boolean(notification.is_read),
        created_at: notification.created_at || notification.createdAt || new Date().toISOString(),
        // Map common field variations
        title: notification.notification_title || notification.title,
        message: notification.notification_text || notification.message,
        href: notification.notification_href || notification.href || '',
        attachments: notification.notification_attachments || notification.attachments || []
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const headers = await this.getAuthHeaders();
      const username = await this.getUsername();
      
      // Fixed URL path to match your backend route
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const headers = await this.getAuthHeaders();
      const username = await this.getUsername();
      
      // Fixed URL path to match your backend route
      const response = await fetch(`http://localhost:5000/api/notifications/user/${username}/read-all`, {
        method: 'PUT',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      const headers = await this.getAuthHeaders();
      const username = await this.getUsername();
      
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const headers = await this.getAuthHeaders();
      const username = await this.getUsername();
      
      const response = await fetch(`http://localhost:5000/api/notifications/user/${username}/unread-count`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to get unread count: ${response.status}`);
      }

      const data = await response.json();
      return data.unread_count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Method to clear cached authentication data
  clearAuthCache() {
    this.username = null;
    this.authHeaders = null;
    Cookies.remove('token');
  }

  // Method to refresh authentication
  async refreshAuth() {
    this.clearAuthCache();
    await this.getUsername();
  }
}