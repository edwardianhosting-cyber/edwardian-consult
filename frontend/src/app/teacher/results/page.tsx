'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, Award, TrendingUp, Users, Calendar, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface CBTResult {
  id: string;
  studentName: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent?: string;
  completedAt: string;
  status?: string;
}

export default function TeacherResults() {
  const [results, setResults] = useState<CBTResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      setLoading(true);
      const data = await api.getCBTResults(1);
      if (data?.success && data.data) {
        setResults(data.data);
      } else if (Array.isArray(data)) {
        setResults(data);
      } else if (data?.data) {
        setResults(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }

  const filteredResults = results.filter((r) =>
    r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.examTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
        <p className="text-gray-600 mt-1">View and monitor student CBT performance</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-xs text-gray-500">Total Results</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length) : 0}%
              </p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(results.map((r) => r.studentName)).size}
              </p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {results.filter((r) => r.percentage >= 60).length}
              </p>
              <p className="text-xs text-gray-500">Passed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or exam name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No results found</p>
            <p className="text-gray-400 text-sm mt-1">Results will appear here once students complete exams</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Exam</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Score</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Percentage</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Time Spent</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{result.studentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.examTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.score} / {result.totalQuestions}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.timeSpent || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
