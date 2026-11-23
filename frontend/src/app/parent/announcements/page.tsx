'use client';

import { useEffect, useState } from 'react';
import { Bell, Pin, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Notice {
  id: string;
  title: string;
  message?: string;
  createdAt?: string;
  isPinned?: boolean;
}

export default function ParentAnnouncementsPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotices();
      setNotices((data as any)?.data || (data as any) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={fetchAnnouncements} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">View announcements for parents</p>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No announcements yet</p>
          <p className="text-gray-400 text-sm mt-1">Announcements will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                    {notice.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                  </div>
                  {notice.message && <p className="text-sm text-gray-600 mt-1">{notice.message}</p>}
                  {notice.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notice.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
