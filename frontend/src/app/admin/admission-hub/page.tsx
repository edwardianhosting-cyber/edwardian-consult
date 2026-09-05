'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, Upload, Bell, Eye, EyeOff, Pin, School } from 'lucide-react';

interface AdmissionAnnouncement {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  category: string;
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: string;
  createdAt: string;
}

export default function AdminAdmissionHubPage() {
  const [announcements, setAnnouncements] = useState<AdmissionAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: 'GENERAL',
    isPublished: true,
    isPinned: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const data = await api.adminGetAdmissionAnnouncements();
      setAnnouncements(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image: '',
      category: 'GENERAL',
      isPublished: true,
      isPinned: false,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: AdmissionAnnouncement) {
    setFormData({
      title: item.title,
      content: item.content,
      excerpt: item.excerpt || '',
      image: item.image || '',
      category: item.category,
      isPublished: item.isPublished,
      isPinned: item.isPinned,
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await api.uploadImage(file, 'admissions');
      setFormData(prev => ({ ...prev, image: (res.data as any).url }));
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        image: formData.image,
        category: formData.category,
        isPublished: formData.isPublished,
        isPinned: formData.isPinned,
      };

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
          <h1 className="text-2xl font-bold text-gray-900">Admission Hub</h1>
          <p className="text-gray-600 mt-1">Manage admission announcements and hub content</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/institutions"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <School className="w-4 h-4" />
            Institutions
          </Link>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Announcement
          </button>
        </div>
      </div>

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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="GENERAL">General</option>
                <option value="JAMB">JAMB</option>
                <option value="POST_UTME">Post-UTME</option>
                <option value="ADMISSION_LIST">Admission List</option>
                <option value="REGISTRATION">Registration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex items-center gap-3">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-20 h-12 object-cover rounded-lg border" />
                )}
                <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Pinned</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Update Announcement' : 'Create Announcement'}
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {announcements.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No announcements yet
                </td>
              </tr>
            ) : (
              announcements.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{item.category}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      {item.isPublished ? (
                        <span className="text-green-600 flex items-center gap-1"><Eye className="w-3 h-3" /> Published</span>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Draft</span>
                      )}
                      {item.isPinned && (
                        <span className="text-yellow-600 flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(item)} className="text-blue-500 hover:text-blue-700">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAnnouncement(item.id)} className="text-red-500 hover:text-red-700">
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
