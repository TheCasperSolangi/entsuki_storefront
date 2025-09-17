// components/layout/ui/notificationDropdownComponent.js
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../context/notificationContext';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationDropdown() {
  const { state, dispatch, service } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && state.notifications.length === 0) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    if (isLoading || !service) return;
    
    setIsLoading(true);
    try {
      const response = await service.fetchNotifications();
      // Extract data from the API response structure
      const notifications = response.data || response;
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (err) {
      console.error('Error loading notifications:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id, event) => {
    event?.stopPropagation();
    try {
      await service.markAsRead(id);
      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await service.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id, event) => {
    event?.stopPropagation();
    try {
      await service.deleteNotification(id);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = (notification, event) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      handleMarkAsRead(notification._id, event);
    }
    
    // Navigate to the href if provided
    if (notification.notification_href) {
      // If you're using Next.js router
      // router.push(notification.notification_href);
      
      // Or for regular navigation
      window.location.href = notification.notification_href;
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={toggleDropdown}
        className="p-2 text-gray-700 hover:text-gray-900 relative transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5 lg:h-6 lg:w-6" />
        {state.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {state.unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : state.error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm">{state.error}</p>
                <button
                  onClick={loadNotifications}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : state.notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {state.notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : 'bg-white'
                    }`}
                    onClick={(e) => handleNotificationClick(notification, e)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {/* Notification Title */}
                        <h4 className={`text-sm ${
                          !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        } mb-1`}>
                          {notification.notification_title}
                        </h4>
                        
                        {/* Notification Text */}
                        <p className={`text-sm ${
                          !notification.is_read ? 'text-gray-800' : 'text-gray-600'
                        } mb-2`}>
                          {notification.notification_text}
                        </p>
                        
                        {/* Notification Code & Date */}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatDate(notification.createdAt || notification.created_at)}
                          </p>
                          {notification.notification_code && (
                            <span className="text-xs text-gray-400 font-mono">
                              {notification.notification_code.split('_')[1]}
                            </span>
                          )}
                        </div>
                        
                     
                      </div>
                      
                      <div className="flex items-center ml-3 space-x-2">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification._id, e)}
                          className="text-gray-400 hover:text-red-600 p-1 transition-colors flex-shrink-0"
                          aria-label="Delete notification"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400">New notifications will appear here</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {state.notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if you have one
                  // router.push('/notifications');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                View all notifications ({state.notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}