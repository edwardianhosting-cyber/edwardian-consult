'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Search, X, Check, Clock, Award } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';

interface MockExam {
  id: string;
  title: string;
  subject?: string;
  duration?: number;
  status: 'DRAFT' | 'PUBLISHED';
  questions?: any[];
  createdAt: string;
}

export default function TeacherCBT() {
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<MockExam | null>(null);
  const [viewingExam, setViewingExam] = useState<MockExam | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyExam = { title: '', subject: '', duration: 60, status: 'DRAFT' as const, questions: [] as any[] };

  const [form, setForm] = useState<{ title: string; subject: string; duration: number; status: 'DRAFT' | 'PUBLISHED'; questions: any[] }>({ ...emptyExam, status: 'DRAFT', questions: [] });

  useEffect(() => {
    fetchMockExams();
  }, []);

  async function fetchMockExams() {
    try {
      setLoading(true);
      const data = await api.getMockExams();
      if (data?.success && data.data) {
        setMockExams(data.data);
      } else if (Array.isArray(data)) {
        setMockExams(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mock exams');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingExam(null);
    setForm({ ...emptyExam, questions: [] });
    setShowModal(true);
  }

  function openEditModal(exam: MockExam) {
    setEditingExam(exam);
    setForm({
      title: exam.title,
      subject: exam.subject || '',
      duration: exam.duration || 60,
      status: exam.status,
      questions: exam.questions || [],
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editingExam) {
        await api.updateMockExam(editingExam.id, form);
      } else {
        await api.createMockExam(form);
      }
      setShowModal(false);
      fetchMockExams();
    } catch (err: any) {
      setError(err.message || 'Failed to save mock exam');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this mock exam?')) return;
    try {
      await api.deleteMockExam(id);
      fetchMockExams();
    } catch (err: any) {
      setError(err.message || 'Failed to delete mock exam');
    }
  }

  async function handlePublish(id: string) {
    try {
      await api.publishMockExam(id);
      fetchMockExams();
    } catch (err: any) {
      setError(err.message || 'Failed to publish mock exam');
    }
  }

  async function handleUnpublish(id: string) {
    try {
      await api.unpublishMockExam(id);
      fetchMockExams();
    } catch (err: any) {
      setError(err.message || 'Failed to unpublish mock exam');
    }
  }

  const filteredExams = mockExams.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CBT / Mock Exams</h1>
          <p className="text-gray-600 mt-1">Create and manage mock exams for your students</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Mock Exam
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search mock exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Mock Exams Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No mock exams found. Create your first mock exam!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Duration</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Questions</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{exam.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exam.subject || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exam.duration ? `${exam.duration} min` : '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exam.questions?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        exam.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {exam.status === 'PUBLISHED' ? <Check className="w-3 h-3" /> : null}
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {exam.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => handleUnpublish(exam.id)}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Unpublish"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(exam.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Publish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(exam)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingExam ? 'Edit Mock Exam' : 'Create Mock Exam'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mock exam title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">Questions can be added later from the Question Bank.</p>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={submitting || !form.title.trim()} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
