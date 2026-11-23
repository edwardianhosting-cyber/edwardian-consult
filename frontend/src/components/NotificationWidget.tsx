'use client';

import { useEffect, useState } from 'react';
import { Bell, ExternalLink, AlertTriangle, AlertCircle, Info } from 'lucide-react';
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
  createdAt: string;
}

export default function NotificationWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  async function fetchRecentNotifications() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(
        `${API_BASE}/notifications/recent?limit=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
    } finally {
      setLoading(false);
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

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Recent Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <Link
          href="/student/notifications"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 transition-colors ${
                !notification.isRead ? 'bg-primary-50/30' : 'hover:bg-gray-50'
              }`}
            >
              {notification.link ? (
                <Link href={notification.link} className="block">
                  <NotificationItem
                    notification={notification}
                    getNotificationIcon={getNotificationIcon}
                    getPriorityIcon={getPriorityIcon}
                    formatTime={formatTime}
                  />
                </Link>
              ) : (
                <NotificationItem
                  notification={notification}
                  getNotificationIcon={getNotificationIcon}
                  getPriorityIcon={getPriorityIcon}
                  formatTime={formatTime}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  getNotificationIcon,
  getPriorityIcon,
  formatTime,
}: {
  notification: Notification;
  getNotificationIcon: (type: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  formatTime: (date: string) => string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {getPriorityIcon(notification.priority)}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
      </div>
    </div>
  );
}
