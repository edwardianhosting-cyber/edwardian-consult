'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import api from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetType: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    targetType: 'ALL',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.adminGetAdmissionAnnouncements();
      const result = (data as any)?.data || data;
      setAnnouncements(result.announcements || result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements');
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
      isActive: true,
      startDate: '',
      endDate: '',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(announcement: Announcement) {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetType: announcement.targetType,
      isActive: announcement.isActive,
      startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
    });
    setEditingId(announcement.id);
    setShowForm(true);
  }

  async function saveAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        targetType: formData.targetType,
        isActive: formData.isActive,
      };
      if (formData.startDate) payload.startDate = new Date(formData.startDate).toISOString();
      if (formData.endDate) payload.endDate = new Date(formData.endDate).toISOString();

      if (editingId) {
        await api.adminUpdateAdmissionAnnouncement(editingId, payload);
      } else {
        await api.adminCreateAdmissionAnnouncement(payload);
      }
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to save announcement');
    }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.adminDeleteAdmissionAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
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
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Manage admission announcements</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Announcement
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
          <form onSubmit={saveAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="ADMISSION">Admission</option>
                  <option value="EXAM">Exam</option>
                  <option value="EVENT">Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All</option>
                  <option value="JAMB">JAMB</option>
                  <option value="WAEC">WAEC</option>
                  <option value="NECO">NECO</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="announcementActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="announcementActive" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Update' : 'Create'} Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {announcements.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No announcements found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Target</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{announcement.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{announcement.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{announcement.targetType}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${announcement.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(announcement)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteAnnouncement(announcement.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
