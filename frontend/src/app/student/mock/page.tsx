'use client';

import { useEffect, useState } from 'react';
import { FileText, Clock, Play, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { showError } from '@/lib/toast';

interface MockExam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  questionsPerSubject: number;
  status: 'available' | 'in_progress' | 'completed';
  score?: number;
  completedAt?: string;
}

export default function MockPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMockExams();
      setExams(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mock exams');
    } finally {
      setLoading(false);
    }
  }

  async function startExam(examId: string) {
    try {
      setLoading(true);
      const res = await api.startMockExam(examId);
      const newExamId = (res as any).data?.examId || (res as any).examId;
      window.location.href = `/student/cbt?examId=${newExamId}&mode=mock`;
    } catch (err: any) {
      showError(err.message || 'Failed to start exam');
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'available':
        return <Play className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-primary-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mock Exams</h1>
          <p className="text-gray-600 mt-1">Practice with mock examinations</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchExams}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
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
        <p className="text-gray-600 mt-1">Practice with mock examinations</p>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No mock exams available</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for new exam opportunities</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  {getStatusIcon(exam.status)}
                  <span className="capitalize">{(exam.status || '').replace('_', ' ')}</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{exam.subject}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exam.duration} mins
                </span>
                <span>{exam.totalQuestions} questions</span>
                <span>100 marks</span>
              </div>
              {exam.status === 'completed' && exam.score !== undefined && (
                <div className="mb-4">
                  <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                    exam.score >= 70 ? 'text-green-600 bg-green-50' :
                    exam.score >= 50 ? 'text-yellow-600 bg-yellow-50' :
                    'text-red-600 bg-red-50'
                  }`}>
                    {exam.score}%
                  </span>
                </div>
              )}
              {exam.status === 'available' && (
                <button
                  onClick={() => startExam(exam.id)}
                  className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Exam
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
