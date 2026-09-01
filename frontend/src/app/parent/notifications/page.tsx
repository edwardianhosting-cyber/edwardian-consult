'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message?: string;
  type?: string;
  priority?: string;
  isRead: boolean;
  createdAt?: string;
  link?: string;
}

export default function ParentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotifications({ page: String(page), limit: '20' });
      setNotifications(data.data?.notifications || data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      // ignore
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">View notifications related to your child</p>
      </div>

      {error && (
        <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
          <button onClick={fetchNotifications} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Try Again
          </button>
        </div>
      )}

      {notifications.length === 0 && !error ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">Notifications about your child will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-shadow hover:shadow-md ${notif.isRead ? 'border-gray-100' : 'border-green-200 bg-green-50/30'}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {notif.isRead ? (
                    <CheckCircle className="w-5 h-5 text-gray-300" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    {notif.createdAt && (
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {notif.message && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                  )}
                  {notif.priority && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {notif.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
