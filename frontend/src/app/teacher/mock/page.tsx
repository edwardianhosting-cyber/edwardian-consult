'use client';

import { useEffect, useState } from 'react';
import { FileText, Clock, Eye } from 'lucide-react';
import api from '@/lib/api';

interface MockExam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  questions?: any[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  topic?: string;
}

export default function TeacherMockExamPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingExam, setViewingExam] = useState<MockExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAllMockExams();
      setExams(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mock exams');
    } finally {
      setLoading(false);
    }
  }

  async function viewExamQuestions(exam: MockExam) {
    setViewingExam(exam);
    setQuestionsLoading(true);
    try {
      const res = await api.getMockExamQuestions(exam.id);
      setQuestions(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
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
          <p className="text-gray-600 mt-1">View mock examination information</p>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mock Exams</h1>
        <p className="text-gray-600 mt-1">View mock examination information</p>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No mock exams available</p>
          <p className="text-gray-400 text-sm mt-1">Please contact the admin for mock exam schedules</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              onClick={() => viewExamQuestions(exam)}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
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
                <span>{exam.totalQuestions} questions</span>
              </div>
              <button className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Questions
              </button>
            </div>
          ))}
        </div>
      )}

      {/* View Questions Modal */}
      {viewingExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingExam.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {viewingExam.subject} • {viewingExam.duration} mins • {viewingExam.totalMarks} marks
                </p>
              </div>
              <button onClick={() => { setViewingExam(null); setQuestions([]); }} className="text-gray-400 hover:text-gray-600 text-xl">
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">This exam is managed by the admin. You can view the questions here, but cannot edit or upload new questions.</p>
            </div>

            {questionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No questions added yet</p>
                <p className="text-gray-400 text-sm mt-1">Questions will be available once added by admin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">Q{idx + 1}: {q.text}</p>
                      <div className="text-sm text-gray-600 ml-4 mb-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className={i === q.correctOption ? 'text-green-600 font-medium' : ''}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-sm text-gray-500 ml-4 mt-2">Explanation: {q.explanation}</p>
                      )}
                      {q.topic && (
                        <p className="text-xs text-gray-400 ml-4 mt-1">Topic: {q.topic}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
