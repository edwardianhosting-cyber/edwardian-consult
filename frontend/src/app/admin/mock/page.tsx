'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Clock, Trash2, Edit, Eye, BookOpen, Upload } from 'lucide-react';
import api from '@/lib/api';

interface MockExam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerSubject: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  questions?: any[];
}

export default function AdminMockExamPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<MockExam | null>(null);
  const [viewingExam, setViewingExam] = useState<MockExam | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    duration: 60,
    questionsPerSubject: 10,
  });

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.adminGetAllMockExams();
      setExams(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mock exams');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingExam(null);
    setFormData({ title: '', subject: '', duration: 60, questionsPerSubject: 10 });
    setShowModal(true);
  }

  function openEditModal(exam: MockExam) {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      duration: exam.duration,
      questionsPerSubject: exam.questionsPerSubject || 10,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('[admin mock] handleSubmit', { editingExam: !!editingExam, formData });
    try {
      if (editingExam) {
        const res = await api.updateMockExam(editingExam.id, formData);
        console.log('[admin mock] update response', res);
      } else {
        const res = await api.createMockExam(formData);
        console.log('[admin mock] create response', res);
      }
      setShowModal(false);
      fetchExams();
    } catch (err: any) {
      console.error('[admin mock] submit error', err);
      alert(err.message || 'Failed to save mock exam');
    }
  }

  async function handleDelete(examId: string) {
    if (!confirm('Are you sure you want to delete this mock exam?')) return;
    try {
      await api.deleteMockExam(examId);
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'Failed to delete mock exam');
    }
  }

  async function handlePublish(examId: string, isPublished: boolean) {
    try {
      if (isPublished) {
        await api.unpublishMockExam(examId);
      } else {
        await api.publishMockExam(examId);
      }
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'Failed to update publish status');
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mock Exams</h1>
          <p className="text-gray-600 mt-1">Manage mock examinations</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchExams} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mock Exams</h1>
          <p className="text-gray-600 mt-1">Manage mock examinations created by teachers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Mock Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No mock exams yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Mock Exam" to create one</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {exam.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{exam.subject}</p>
               <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                 <span className="flex items-center gap-1">
                   <Clock className="w-4 h-4" />
                   {exam.duration} mins
                 </span>
                 <span>{exam.totalQuestions || 0} questions</span>
                 <span>100 marks</span>
               </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingExam(exam)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(exam)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePublish(exam.id, exam.isPublished)}
                  className={`p-2 border rounded-lg ${
                    exam.isPublished
                      ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {exam.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingExam ? 'Edit Mock Exam' : 'Create Mock Exam'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Questions Per Subject</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.questionsPerSubject}
                  onChange={(e) => setFormData({ ...formData, questionsPerSubject: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Total marks will always be 100</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {editingExam ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Questions Modal */}
      {viewingExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{viewingExam.title}</h2>
              <button onClick={() => setViewingExam(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
             <div className="space-y-2">
               <p className="text-sm text-gray-600">Subject: {viewingExam.subject}</p>
               <p className="text-sm text-gray-600">Duration: {viewingExam.duration} minutes</p>
               <p className="text-sm text-gray-600">Questions Per Subject: {viewingExam.questionsPerSubject || 0}</p>
               <p className="text-sm text-gray-600">Total Marks: {viewingExam.totalMarks}</p>
               <p className="text-sm text-gray-600">Questions: {viewingExam.totalQuestions || 0}</p>
               <p className="text-sm text-gray-600">Status: {viewingExam.isPublished ? 'Published' : 'Draft'}</p>
             </div>
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
              {viewingExam.questions && viewingExam.questions.length > 0 ? (
                <div className="space-y-3">
                  {viewingExam.questions.map((q: any, idx: number) => (
                    <div key={q.id || idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">Q{idx + 1}: {q.text || q.question?.text}</p>
                      {q.options && (
                        <div className="text-sm text-gray-600 ml-4">
                          {q.options.map((opt: string, i: number) => (
                            <div key={i}>{String.fromCharCode(65 + i)}. {opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No questions added yet. Teachers can add questions to this exam.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
