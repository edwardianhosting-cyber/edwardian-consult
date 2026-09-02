'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, AlertTriangle, Info, Calendar, Clock, Newspaper, Bell } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  targetType: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    targetType: 'ALL',
    isPinned: false,
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    try {
      setLoading(true);
      const data = await api.getAllNotices();
      setNotices(data.data?.notices || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      content: '',
      type: 'GENERAL',
      targetType: 'ALL',
      isPinned: false,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(notice: Notice) {
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      targetType: notice.targetType,
      isPinned: notice.isPinned,
    });
    setEditingId(notice.id);
    setShowForm(true);
  }

  async function saveNotice(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        targetType: formData.targetType,
        isPinned: formData.isPinned,
      };

      if (editingId) {
        await api.updateNotice(editingId, payload);
      } else {
        await api.createNotice(payload);
      }
      resetForm();
      fetchNotices();
    } catch (err: any) {
      alert(err.message || 'Failed to save notice');
    }
  }

  async function deleteNotice(id: string) {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-gray-600 mt-1">Manage notices and announcements</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/news"
            className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1 border border-gray-200 rounded-lg hover:border-primary-300"
          >
            <Newspaper className="w-4 h-4" /> News
          </Link>
          <Link
            href="/admin/notifications"
            className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1 border border-gray-200 rounded-lg hover:border-primary-300"
          >
            <Bell className="w-4 h-4" /> Notifications
          </Link>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Notice
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Notice' : 'New Notice'}</h2>
          <form onSubmit={saveNotice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="EXAM_TIMETABLE">Exam Timetable</option>
                  <option value="SCHEDULE_CHANGE">Schedule Change</option>
                  <option value="CLASS">Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Students</option>
                  <option value="JAMB">JAMB Students</option>
                  <option value="WAEC">WAEC Students</option>
                  <option value="NECO">NECO Students</option>
                  <option value="SS3">SS3 Students</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Pin this notice</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Update Notice' : 'Create Notice'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Target</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {notices.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No notices yet
                </td>
              </tr>
            ) : (
              notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{notice.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 flex items-center gap-2">
                    {getTypeIcon(notice.type)}
                    {notice.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{notice.targetType}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(notice)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
