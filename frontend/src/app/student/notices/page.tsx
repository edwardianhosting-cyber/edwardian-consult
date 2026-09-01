'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Bell, AlertTriangle, Info, Calendar, Clock } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
  createdAt: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotices();
      setNotices(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'EMERGENCY':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'EXAM_TIMETABLE':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'SCHEDULE_CHANGE':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-primary-500" />;
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'EMERGENCY':
        return 'border-red-200 bg-red-50';
      case 'EXAM_TIMETABLE':
        return 'border-blue-200 bg-blue-50';
      case 'SCHEDULE_CHANGE':
        return 'border-orange-200 bg-orange-50';
      case 'CLASS':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-gray-600 mt-1">Important announcements and updates</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchNotices}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
        <p className="text-gray-600 mt-1">Important announcements and updates</p>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notices</p>
          <p className="text-gray-400 text-sm mt-1">Important announcements will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`rounded-xl border-2 p-6 ${getTypeColor(notice.type)} ${
                notice.isPinned ? 'ring-2 ring-yellow-300' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notice.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {notice.isPinned && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                        📌 Pinned
                      </span>
                    )}
                    <span className="text-xs text-gray-500 uppercase font-medium">
                      {notice.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{notice.title}</h3>
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">{notice.content}</p>
                  <p className="text-sm text-gray-500 mt-4">
                    {new Date(notice.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
