'use client';

import { useEffect, useState } from 'react';
import { Award, Calendar, BookOpen, ChevronRight, Search } from 'lucide-react';
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
  examType?: string;
}

export default function ParentResultsPage() {
  const [results, setResults] = useState<CBTResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<CBTResult | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCBTResults(1);
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

  const filteredResults = results.filter((result) =>
    result.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <span className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{result.subject}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(result.completedAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {result.correctAnswers}/{result.totalQuestions} correct
                  </span>
                  {result.duration && (
                    <span className="text-xs text-gray-400">
                      {Math.floor(result.duration / 60)}m {result.duration % 60}s
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Result Details</h3>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium text-gray-900">{selectedResult.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-2xl font-bold text-gray-900">{selectedResult.score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Performance</p>
                <p className="font-medium text-gray-900">
                  {selectedResult.correctAnswers} out of {selectedResult.totalQuestions} correct
                </p>
              </div>
              {selectedResult.duration && (
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">
                    {Math.floor(selectedResult.duration / 60)} minutes {selectedResult.duration % 60} seconds
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedResult.completedAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
