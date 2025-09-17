// context/notificationReducer.js
export const initialState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0
};

export const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'SET_NOTIFICATIONS':
      const notifications = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        notifications,
        unreadCount: notifications.filter(n => !n.is_read).length,
        loading: false,
        error: null
      };

    case 'ADD_NOTIFICATION':
      const newNotification = action.payload;
      // Prevent duplicate notifications
      const exists = state.notifications.some(
        n => (n.notification_id || n._id) === (newNotification.notification_id || newNotification._id)
      );
      
      if (exists) {
        return state;
      }

      const updatedNotifications = [newNotification, ...state.notifications];
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.is_read).length
      };

    case 'UPDATE_NOTIFICATION':
      const updateData = action.payload;
      const updatedList = state.notifications.map(notification => {
        if ((notification.notification_id || notification._id) === updateData.id) {
          return { ...notification, ...updateData };
        }
        return notification;
      });
      
      return {
        ...state,
        notifications: updatedList,
        unreadCount: updatedList.filter(n => !n.is_read).length
      };

    case 'MARK_AS_READ':
      const notificationId = action.payload;
      const markedAsRead = state.notifications.map(notification => {
        if ((notification.notification_id || notification._id) === notificationId) {
          return { ...notification, is_read: true };
        }
        return notification;
      });
      
      return {
        ...state,
        notifications: markedAsRead,
        unreadCount: markedAsRead.filter(n => !n.is_read).length
      };

    case 'MARK_ALL_AS_READ':
      const allMarkedAsRead = state.notifications.map(notification => ({
        ...notification,
        is_read: true
      }));
      
      return {
        ...state,
        notifications: allMarkedAsRead,
        unreadCount: 0
      };

    case 'DELETE_NOTIFICATION':
      const deleteId = action.payload;
      const filteredNotifications = state.notifications.filter(
        notification => (notification.notification_id || notification._id) !== deleteId
      );
      
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.is_read).length
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload
      };

    default:
      return state;
  }
};