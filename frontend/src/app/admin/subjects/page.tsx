'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Download, BookOpen } from 'lucide-react';
import { studyApi } from '@/lib/api';

interface StudySubject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  gradeLevel?: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  topics?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    gradeLevel: '',
    icon: 'BookOpen',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      setLoading(true);
      const data = await studyApi.getSubjects();
      setSubjects(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        subject.name?.toLowerCase().includes(query) ||
        subject.code?.toLowerCase().includes(query) ||
        subject.description?.toLowerCase().includes(query);
      const matchesFilter = statusFilter === 'all' ||
        (statusFilter === 'active' && subject.isActive) ||
        (statusFilter === 'inactive' && !subject.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [subjects, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = subjects.length;
    const active = subjects.filter((s) => s.isActive).length;
    const inactive = total - active;
    const withTopics = subjects.filter((s) => s.topics && s.topics.length > 0).length;
    return { total, active, inactive, withTopics };
  }, [subjects]);

  function resetForm() {
    setFormData({
      name: '',
      code: '',
      description: '',
      gradeLevel: '',
      icon: 'BookOpen',
      imageUrl: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(subject: StudySubject) {
    setFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      gradeLevel: subject.gradeLevel || '',
      icon: subject.icon || 'BookOpen',
      imageUrl: subject.imageUrl || '',
      isActive: subject.isActive,
    });
    setEditingId(subject.id);
    setShowForm(true);
  }

  async function saveSubject(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        gradeLevel: formData.gradeLevel || undefined,
        icon: formData.icon,
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive,
      };

      if (editingId) {
        await studyApi.updateSubject(editingId, payload);
      } else {
        await studyApi.createSubject(payload);
      }
      resetForm();
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Failed to save subject');
    }
  }

  async function deleteSubject(id: string) {
    if (!confirm('Delete this subject?')) return;
    try {
      await studyApi.deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    }
  }

  function handleExportPdf() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-1">Manage study subjects</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Subjects</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">With Topics</p>
          <p className="text-2xl font-bold text-primary-600">{stats.withTopics}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="printable-area bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No subjects found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Grade Level</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Topics</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{subject.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{subject.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{subject.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{subject.code || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{subject.gradeLevel || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{subject.topics?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        subject.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(subject)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSubject(subject.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                <input
                  type="text"
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-area,
          .printable-area *,
          .printable-area * * {
            visibility: visible !important;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}
