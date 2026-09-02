'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Search, X, FileText, Image, CheckCircle, Download, Upload } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';

interface Question {
  id: string;
  subject: string;
  examType?: string;
  topic?: string;
  difficulty?: string;
  text: string;
  imageUrl?: string;
  options?: string[];
  correctOption?: number;
  explanation?: string;
  createdAt: string;
}

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const emptyQuestion = { subject: '', examType: '', topic: '', difficulty: 'MEDIUM', text: '', options: ['', '', '', ''], correctOption: 0, explanation: '', imageUrl: undefined as string | undefined };
  const [form, setForm] = useState({ ...emptyQuestion, options: ['', '', '', ''] as string[] });

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      setLoading(true);
      const params: Record<string, string> = { limit: '100' };
      if (subjectFilter) params.subject = subjectFilter;
      const data = await api.getAllQuestions(params);
      if (data?.success && data.data) {
        setQuestions(data.data);
      } else if (Array.isArray(data)) {
        setQuestions(data);
      } else if (data?.data) {
        setQuestions(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingQuestion(null);
    setForm({ ...emptyQuestion, options: ['', '', '', ''] });
    setShowModal(true);
  }

  function openEditModal(question: Question) {
    setEditingQuestion(question);
    setForm({
      subject: question.subject || '',
      examType: question.examType || '',
      topic: question.topic || '',
      difficulty: question.difficulty || 'MEDIUM',
      text: question.text || '',
      options: question.options || ['', '', '', ''],
      correctOption: question.correctOption ?? 0,
      explanation: question.explanation || '',
      imageUrl: question.imageUrl,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, form);
      } else {
        await api.createQuestion(form);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to save question');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteQuestion(id);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete question');
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkFile) return;
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const response = await api.uploadQuestionsFile(bulkFile);
      setBulkResult(response.data);
      await fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setBulkLoading(false);
      setBulkFile(null);
    }
  }

  async function downloadSample(format: 'csv' | 'excel') {
    try {
      const blob = await api.downloadQuestionSample(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-sample.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download sample');
    }
  }

  async function handleImageUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return;
    setImageLoading(true);
    try {
      const response = await api.uploadQuestionImage(imageFile);
      setUploadedImageUrl(response.data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setImageLoading(false);
    }
  }

  function updateOption(index: number, value: string) {
    const newOpts = [...form.options];
    newOpts[index] = value;
    setForm({ ...form, options: newOpts });
  }

  const uniqueSubjects = Array.from(new Set(questions.map((q) => q.subject).filter(Boolean))) as string[];
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !subjectFilter || q.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">Bulk upload questions via Excel, view and manage your question bank</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Bulk Upload */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary-600" />
          Bulk Upload Questions (CSV or Excel)
        </h3>
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question File</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-gray-500 mt-1">Supported formats: CSV (.csv) or Excel (.xlsx, .xls)</p>
          </div>
          <button
            type="submit"
            disabled={!bulkFile || bulkLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {bulkLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload File
              </>
            )}
          </button>
        </form>

        <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Need a template?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadSample('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-gray-200 rounded-lg hover:bg-primary-50"
            >
              <Download className="h-3.5 w-3.5" />
              Sample CSV
            </button>
            <button
              type="button"
              onClick={() => downloadSample('excel')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-gray-200 rounded-lg hover:bg-primary-50"
            >
              <Download className="h-3.5 w-3.5" />
              Sample Excel
            </button>
          </div>
        </div>

        {bulkResult && (
          <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">File Processed</span>
            </div>
            <p className="text-sm text-gray-600">Created: {bulkResult.created} questions</p>
            {bulkResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700">Errors:</p>
                <ul className="text-xs text-red-600 list-disc list-inside max-h-40 overflow-y-auto">
                  {bulkResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No questions found</p>
            <p className="text-gray-400 text-sm mt-1">Upload questions or add them manually</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Topic</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Difficulty</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Question</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{question.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{question.topic || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                        question.difficulty === 'HARD' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {question.difficulty || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{question.text}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(question)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Algebra"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                {form.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  />
                ))}
                <select
                  value={form.correctOption}
                  onChange={(e) => setForm({ ...form, correctOption: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {form.options.map((_, idx) => (
                    <option key={idx} value={idx}>Correct: {String.fromCharCode(65 + idx)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="Explanation for the correct answer"
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={submitting || !form.text.trim()} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
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
