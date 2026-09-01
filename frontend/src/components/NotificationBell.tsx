'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Check, CheckCheck, ExternalLink, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  link?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }

  async function markAsRead(id: string) {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'CBT':
      case 'EXAM':
        return '📝';
      case 'RESULT':
        return '📊';
      case 'PAYMENT':
        return '💳';
      case 'ADMISSION':
        return '🎓';
      case 'ASSIGNMENT':
        return '📚';
      case 'MATERIAL':
        return '📖';
      case 'ANNOUNCEMENT':
        return '📢';
      case 'CERTIFICATE':
        return '🏆';
      case 'ID_CARD':
        return '🪪';
      case 'REMINDER':
        return '⏰';
      case 'PROFILE':
        return '👤';
      case 'MESSAGE':
        return '✉️';
      default:
        return '🔔';
    }
  }

  function getPriorityIcon(priority: string) {
    switch (priority) {
      case 'URGENT':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'IMPORTANT':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  }

  function getPriorityColor(priority: string, isRead: boolean) {
    if (isRead) return 'border-gray-100';
    switch (priority) {
      case 'URGENT':
        return 'border-red-300 bg-red-50';
      case 'IMPORTANT':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-blue-200';
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  const urgentCount = notifications.filter(n => n.priority === 'URGENT' && !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 text-xs font-bold rounded-full flex items-center justify-center ${
            urgentCount > 0 ? 'bg-red-500' : 'bg-primary-600'
          } text-white`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm mt-1">We'll notify you when something important happens</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-50 transition-colors ${getPriorityColor(notification.priority, notification.isRead)}`}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        setIsOpen(false);
                      }}
                      className="block p-4 hover:bg-gray-50"
                    >
                      <NotificationContent
                        notification={notification}
                        getNotificationIcon={getNotificationIcon}
                        getPriorityIcon={getPriorityIcon}
                        formatTime={formatTime}
                      />
                    </Link>
                  ) : (
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <NotificationContent
                        notification={notification}
                        getNotificationIcon={getNotificationIcon}
                        getPriorityIcon={getPriorityIcon}
                        formatTime={formatTime}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
              <Link
                href="/student/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
              >
                View All Notifications
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationContent({
  notification,
  getNotificationIcon,
  getPriorityIcon,
  formatTime,
}: {
  notification: Notification;
  getNotificationIcon: (type: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  formatTime: (dateStr: string) => string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-xl flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {getPriorityIcon(notification.priority)}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </div>
        </div>
        <p className={`text-sm mt-1 line-clamp-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">{formatTime(notification.createdAt)}</p>
          {notification.link && (
            <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
              View
              <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
