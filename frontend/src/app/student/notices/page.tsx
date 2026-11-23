'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Bell, AlertTriangle, Info, Calendar, Clock, Check } from 'lucide-react';

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
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

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

  function closeDetail() {
    setSelectedNotice(null);
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
      {/* Notice Detail Overlay */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-start p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Notice Details</h2>
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  {!selectedNotice.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full mb-2" />}
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedNotice.title}</h3>
                  <span className="text-xs text-gray-500 uppercase font-medium">
                    {selectedNotice.type.replace('_', ' ')}
                  </span>
                  {selectedNotice.isPinned && (
                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      📌 Pinned
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getTypeIcon(selectedNotice.type)}
                </div>
              </div>
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Content</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(selectedNotice.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`text-sm font-medium ${selectedNotice.isRead ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedNotice.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
              {!selectedNotice.isRead && (
                <button
                  onClick={() => {
                    setNotices(prev => prev.map(n => n.id === selectedNotice!.id ? { ...n, isRead: true } : n));
                    closeDetail();
                  }}
                  className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 w-full text-center flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark as read
                </button>
              )}
              <button
                onClick={closeDetail}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 w-full text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => setSelectedNotice(notice)}
              className="cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-md ${getTypeColor(notice.type)} ${notice.isPinned ? 'ring-2 ring-yellow-300' : ''}"
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
