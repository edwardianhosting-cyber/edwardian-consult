'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Search, X, Check } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  dueDate?: string;
  status: 'DRAFT' | 'PUBLISHED';
  questions?: any[];
  createdAt: string;
}

interface QuestionInput {
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyAssignment = { title: '', description: '', subject: '', dueDate: '', status: 'DRAFT' as const, questions: [] as QuestionInput[] };

  const [form, setForm] = useState<{ title: string; description: string; subject: string; dueDate: string; status: 'DRAFT' | 'PUBLISHED'; questions: QuestionInput[] }>({ ...emptyAssignment, status: 'DRAFT', questions: [] });

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      setLoading(true);
      const data = await api.getAssignments();
      if (data?.success && data.data) {
        setAssignments(data.data);
      } else if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingAssignment(null);
    setForm({ ...emptyAssignment, questions: [] });
    setShowModal(true);
  }

  function openEditModal(assignment: Assignment) {
    setEditingAssignment(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description || '',
      subject: assignment.subject || '',
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
      status: assignment.status,
      questions: assignment.questions?.map((q: any) => ({
        text: q.text,
        options: q.options || [],
        correctOption: q.correctOption ?? 0,
        explanation: q.explanation || '',
      })) || [],
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editingAssignment) {
        await api.updateAssignment(editingAssignment.id, form);
      } else {
        await api.createAssignment(form);
      }
      setShowModal(false);
      fetchAssignments();
    } catch (err: any) {
      setError(err.message || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.deleteAssignment(id);
      fetchAssignments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete assignment');
    }
  }

  async function handlePublish(id: string) {
    try {
      await api.publishAssignment(id);
      fetchAssignments();
    } catch (err: any) {
      setError(err.message || 'Failed to publish assignment');
    }
  }

  async function handleUnpublish(id: string) {
    try {
      await api.unpublishAssignment(id);
      fetchAssignments();
    } catch (err: any) {
      setError(err.message || 'Failed to unpublish assignment');
    }
  }

  function addQuestion() {
    setForm({
      ...form,
      questions: [...form.questions, { text: '', options: ['', '', '', ''], correctOption: 0, explanation: '' }],
    });
  }

  function updateQuestion(index: number, field: string, value: any) {
    const updated = [...form.questions];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, questions: updated });
  }

  function removeQuestion(index: number) {
    const updated = form.questions.filter((_, i) => i !== index);
    setForm({ ...form, questions: updated });
  }

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Create and manage assignments for your students</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Assignment
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
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No assignments found. Create your first assignment!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Due Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{assignment.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{assignment.subject || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        assignment.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {assignment.status === 'PUBLISHED' ? <Check className="w-3 h-3" /> : null}
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {assignment.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => handleUnpublish(assignment.id)}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Unpublish"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(assignment.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Publish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
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
                {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
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
                  placeholder="Assignment title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Assignment description"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                  >
                    + Add Question
                  </button>
                </div>
                {form.questions.map((q, idx) => (
                  <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Question {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      placeholder="Question text"
                    />
                    {q.options.map((opt, optIdx) => (
                      <input
                        key={optIdx}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[optIdx] = e.target.value;
                          updateQuestion(idx, 'options', newOpts);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      />
                    ))}
                    <div className="flex items-center gap-3">
                      <select
                        value={q.correctOption}
                        onChange={(e) => updateQuestion(idx, 'correctOption', Number(e.target.value))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      >
                        {q.options.map((_, optIdx) => (
                          <option key={optIdx} value={optIdx}>
                            Correct: {String.fromCharCode(65 + optIdx)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* View Modal */}
      {viewingAssignment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{viewingAssignment.title}</h2>
              <button onClick={() => setViewingAssignment(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {viewingAssignment.description && (
                <p className="text-gray-700">{viewingAssignment.description}</p>
              )}
              {viewingAssignment.questions && viewingAssignment.questions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Questions</h3>
                  {viewingAssignment.questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.text}</p>
                      {q.options && (
                        <div className="space-y-1 ml-4">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className={`text-sm ${optIdx === q.correctOption ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                              {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correctOption ? '(Correct)' : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button onClick={() => setViewingAssignment(null)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
