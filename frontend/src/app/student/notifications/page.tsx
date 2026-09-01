'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Bell, Check, CheckCheck, ExternalLink, AlertTriangle, AlertCircle, Info, Filter, Search,  } from 'lucide-react';
import Link from 'next/link';

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

const notificationTypes = [
  { value: 'ALL', label: 'All', icon: '🔔' },
  { value: 'CBT', label: 'CBT', icon: '📝' },
  { value: 'RESULT', label: 'Results', icon: '📊' },
  { value: 'PAYMENT', label: 'Payments', icon: '💳' },
  { value: 'ADMISSION', label: 'Admission', icon: '🎓' },
  { value: 'ASSIGNMENT', label: 'Assignments', icon: '📚' },
  { value: 'MATERIAL', label: 'Materials', icon: '📖' },
  { value: 'ANNOUNCEMENT', label: 'Announcements', icon: '📢' },
  { value: 'REMINDER', label: 'Reminders', icon: '⏰' },
  { value: 'CERTIFICATE', label: 'Certificates', icon: '🏆' },
  { value: 'ID_CARD', label: 'ID Card', icon: '🪪' },
  { value: 'MESSAGE', label: 'Messages', icon: '✉️' },
  { value: 'PROFILE', label: 'Profile', icon: '👤' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [activeType, setActiveType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      };

      if (activeType !== 'ALL') params.type = activeType;
      if (activeFilter === 'unread') params.isRead = 'false';

      const data = await api.getNotifications(params);
      const result = data as any;
      setNotifications(result.data?.notifications || []);
      setUnreadCount(result.data?.unreadCount || 0);
      setTotalPages(result.data?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [page, activeType, activeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAsRead(id: string) {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    }
  }

  async function markAllAsRead() {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  }

  function getNotificationIcon(type: string) {
    const found = notificationTypes.find(t => t.value === type);
    return found?.icon || '🔔';
  }

  function getPriorityConfig(priority: string) {
    switch (priority) {
      case 'URGENT':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700',
        };
      case 'IMPORTANT':
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-700',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
        };
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const filteredNotifications = notifications.filter(n => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your latest notifications</p>
          </div>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          {notificationTypes.slice(1).map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeType === type.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No notifications found</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeFilter === 'unread'
              ? "You've read all your notifications"
              : 'Notifications will appear here when available'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const priorityConfig = getPriorityConfig(notification.priority);

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                  notification.isRead
                    ? 'border-gray-100'
                    : priorityConfig.border
                } ${!notification.isRead ? priorityConfig.bg : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full" />
                          )}
                          <h3 className={`font-semibold ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                        </div>
                        <p className={`text-sm ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig.badge}`}>
                            {notification.priority}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {priorityConfig.icon}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={() => !notification.isRead && markAsRead(notification.id)}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                          {getActionLabel(notification.type)}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function getActionLabel(type: string): string {
  switch (type) {
    case 'CBT':
    case 'EXAM':
      return 'Take Exam';
    case 'RESULT':
      return 'View Result';
    case 'PAYMENT':
      return 'View Receipt';
    case 'ADMISSION':
      return 'View Application';
    case 'ASSIGNMENT':
      return 'View Assignment';
    case 'MATERIAL':
      return 'View Material';
    case 'ANNOUNCEMENT':
      return 'Read More';
    case 'CERTIFICATE':
      return 'View Certificate';
    case 'ID_CARD':
      return 'View ID Card';
    case 'REMINDER':
      return 'View Details';
    case 'MESSAGE':
      return 'Read Message';
    case 'PROFILE':
      return 'Complete Profile';
    default:
      return 'View';
  }
}
