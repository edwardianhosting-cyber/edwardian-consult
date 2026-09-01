'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Award, Calendar, BookOpen, ChevronRight } from 'lucide-react';

interface CBTResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  duration?: number;
}

export default function MockResultsPage() {
  const [results, setResults] = useState<CBTResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMockResults();
      setResults(data.data?.results || data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
          <h1 className="text-2xl font-bold text-gray-900">Mock Exam Results</h1>
          <p className="text-gray-600 mt-1">View your mock examination results</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mock Exam Results</h1>
          <p className="text-gray-600 mt-1">View your mock examination results</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No mock results yet</p>
          <p className="text-gray-400 text-sm mt-1">Complete mock exams to see your results here</p>
          <a
            href="/student/mock"
            className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Take Mock Exam
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mock Exam Results</h1>
        <p className="text-gray-600 mt-1">View your mock examination results</p>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{result.subject}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(result.completedAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(result.score)}`}>
                  {result.score}%
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {result.correctAnswers}/{result.totalQuestions} correct
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
