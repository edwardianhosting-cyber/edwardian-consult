'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, Eye, EyeOff, Newspaper, Bell, Megaphone, Upload } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  isPublished: boolean;
  isPinned: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    excerpt: '',
    coverImage: '',
    isPublished: true,
    isPinned: false,
    targetType: 'ALL',
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      const data = await api.getAllNews();
      setArticles(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      category: '',
      content: '',
      excerpt: '',
      coverImage: '',
      isPublished: true,
      isPinned: false,
      targetType: 'ALL',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(article: NewsArticle) {
    setFormData({
      title: article.title,
      category: article.category,
      content: article.content,
      excerpt: article.excerpt || '',
      coverImage: article.coverImage || '',
      isPublished: article.isPublished,
      isPinned: article.isPinned,
      targetType: (article as any).targetType || 'ALL',
    });
    setEditingId(article.id);
    setShowForm(true);
  }

  async function saveArticle(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        coverImage: formData.coverImage || undefined,
        isPublished: formData.isPublished,
        isPinned: formData.isPinned,
        targetType: 'ALL',
      };

      if (editingId) {
        await api.updateNews(editingId, payload);
      } else {
        await api.createNews(payload);
      }
      resetForm();
      fetchArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to save article');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await api.uploadImage(file, 'news');
      setFormData(prev => ({ ...prev, coverImage: (res.data as any).url }));
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article?')) return;
    try {
      await api.deleteNews(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete article');
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
          <h1 className="text-2xl font-bold text-gray-900">News & Updates</h1>
          <p className="text-gray-600 mt-1">Manage news articles and updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/notices"
            className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1 border border-gray-200 rounded-lg hover:border-primary-300"
          >
            <Megaphone className="w-4 h-4" />
            Notices
          </Link>
          <Link
            href="/admin/notifications"
            className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1 border border-gray-200 rounded-lg hover:border-primary-300"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </Link>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Article
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Article' : 'New Article'}</h2>
          <form onSubmit={saveArticle} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
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
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="flex items-center gap-3">
                {formData.coverImage && (
                  <img src={formData.coverImage} alt="Cover" className="w-20 h-12 object-cover rounded-lg border" />
                )}
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Image URL"
                />
                <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Students & Public</option>
                <option value="JAMB">JAMB Students Only</option>
                <option value="WAEC">WAEC Students Only</option>
                <option value="NECO">NECO Students Only</option>
                <option value="STUDENT">Students Only (Not Public)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                "Students Only" keeps the article inside the student portal (won't appear on the public news page).
              </p>
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
                {editingId ? 'Update Article' : 'Create Article'}
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Target</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Views</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No articles yet
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium max-w-xs truncate">{article.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{article.category}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {(article as any).targetType || 'ALL'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      {article.isPublished ? (
                        <span className="text-green-600 flex items-center gap-1"><Eye className="w-3 h-3" /> Published</span>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Draft</span>
                      )}
                      {article.isPinned && (
                        <span className="text-yellow-600 text-xs">Pinned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{article.viewCount}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(article)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteArticle(article.id)}
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
