'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit3, Eye, Upload, FileText, ArrowLeft } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import QuestionUpload from '@/components/QuestionUpload';

interface Question {
  id: string;
  subject: string;
  examType: string;
  text: string;
  imageUrl?: string;
  year?: number;
  topic?: string;
  groupType?: string;
  groupId?: string;
  groupOrder?: number;
  isActive?: boolean;
  updatedAt?: string;
}

interface QuestionGroup {
  id: string;
  subject: string;
  examType: string;
  groupType: string;
  title?: string;
  instructions?: string;
  passage?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { questions: number };
}

const QUESTION_TYPES = [
  { value: 'STANDALONE', label: 'Standalone' },
  { value: 'COMPREHENSION', label: 'Comprehension' },
  { value: 'CLOZE', label: 'Cloze / Fill in the Gaps' },
  { value: 'LITERATURE', label: 'Literature' },
  { value: 'GRAMMAR', label: 'Grammar' },
  { value: 'LEXIS', label: 'Lexis' },
  { value: 'ORAL_ENGLISH', label: 'Oral English' },
  { value: 'STRESS', label: 'Stress' },
  { value: 'SOUNDS', label: 'Sounds' },
  { value: 'OTHER', label: 'Other' },
];

const EXAM_TYPES = ['JAMB', 'WAEC', 'NECO', 'POST-UTME', 'MOCK'] as const;
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
    fetchGroups();
  }, [subject, examType, questionType, statusFilter]);

  async function fetchSubjects() {
    try {
      const response = await api.getAllPrograms?.();
      const data = response?.data || [];
      const subjectNames = data.map((s: any) =>s.name).filter(Boolean);
      setSubjects(subjectNames.length > 0 ? subjectNames : ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature in English', 'Geography', 'History']);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects(['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature in English', 'Geography', 'History']);
    }
  }

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (subject) params.subject = subject;
      if (examType) params.examType = examType;
      if (questionType) params.groupType = questionType;
      const response = await api.getAllQuestions(params);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGroups() {
    try {
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (examType) params.set('examType', examType);
      if (questionType) params.set('groupType', questionType);
      if (statusFilter !== 'ALL') params.set('isActive', statusFilter === 'ACTIVE' ? 'true' : 'false');

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://10.76.232.172:5000'}/api/question-groups?${params.toString()}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  }

  const filteredQuestions = questions.filter(q => {
    if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (questionType && q.groupType !== questionType) {
      return false;
    }
    if (statusFilter === 'ACTIVE' && q.isActive === false) return false;
    if (statusFilter === 'INACTIVE' && q.isActive !== false) return false;
    return true;
  });

  const filteredGroups = groups.filter(g => {
    if (searchQuery && !g.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !g.passage?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (questionType && g.groupType !== questionType) return false;
    if (statusFilter === 'ACTIVE' && g.isActive === false) return false;
    if (statusFilter === 'INACTIVE' && g.isActive !== false) return false;
    return true;
  });

  function handleQuestionUploaded() {
    fetchQuestions();
    fetchGroups();
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteQuestion(id);
      showSuccess('Question deleted successfully');
      fetchQuestions();
      fetchGroups();
    } catch (error: any) {
      showError(error.message || 'Failed to delete question');
    }
  }

  async function handleDeleteGroup(id: string) {
    if (!confirm('Are you sure you want to delete this group? Questions in this group will become ungrouped.')) return;
    try {
      await api.deleteQuestionGroup(id);
      showSuccess('Group deleted successfully');
      fetchQuestions();
      fetchGroups();
    } catch (error: any) {
      showError(error.message || 'Failed to delete group');
    }
  }

  if (showUploadForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-600 mt-1">Upload questions via CSV, Excel, or JSON, and manage question images</p>
          </div>
          <button
            onClick={() => setShowUploadForm(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Question Bank
          </button>
        </div>
        <QuestionUpload onUploaded={handleQuestionUploaded} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">Manage questions for all examinations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Add Questions
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Exam Types</option>
              {EXAM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Questions</h3>
          <span className="text-xs text-gray-500">{filteredQuestions.length} questions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Question</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Exam Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.slice(0, 50).map((q) => (
                <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 max-w-md truncate">{q.text}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700">
                      {q.groupType || 'STANDALONE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {q.groupId ? (
                      <span className="text-xs text-primary-600">{q.groupId.slice(0, 8)}...</span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{q.subject}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-accent-500/10 text-accent-400">
                      {q.examType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      q.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {q.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => q.groupId ? window.open(`/admin/english-setup?group=${q.groupId}`, '_blank') : null}
                        className={`p-1.5 rounded ${q.groupId ? 'text-gray-400 hover:text-primary-600 hover:bg-primary-50' : 'text-gray-300 cursor-not-allowed'}`}
                        title={q.groupId ? 'Edit Group' : 'No group'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Question Groups</h3>
          <span className="text-xs text-gray-500">{filteredGroups.length} groups</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Exam Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Questions</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{group.title || `Group ${group.id.slice(0, 8)}`}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700">
                      {group.groupType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{group.subject}</td>
                  <td className="px-4 py-3 text-gray-600">{group.examType}</td>
                  <td className="px-4 py-3 text-gray-600">{group._count?.questions ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(`/admin/english-setup?group=${group.id}`, '_blank')}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No groups found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
