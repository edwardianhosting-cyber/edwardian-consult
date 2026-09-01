'use client';

import { useEffect, useState } from 'react';
import { Award, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface CBTResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  duration?: number;
  type?: string;
}

export default function ParentResultsPage() {
  const [results, setResults] = useState<CBTResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchResults();
  }, [page]);

  async function fetchResults() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCBTResults(page);
      const resultsData = data.data?.results || data.data || [];
      setResults(Array.isArray(resultsData) ? resultsData : []);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CBT Results</h1>
          <p className="text-gray-600 mt-1">View your child&apos;s examination results</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchResults} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CBT Results</h1>
        <p className="text-gray-600 mt-1">View your child&apos;s examination results</p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No results yet</p>
          <p className="text-gray-400 text-sm mt-1">Results will appear here after completing CBTs</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
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
                    {result.duration && (
                      <p className="text-xs text-gray-400 mt-0.5">Duration: {Math.floor(result.duration / 60)}m {result.duration % 60}s</p>
                    )}
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
      )}

      {results.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
