'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Award, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface PerformanceData {
  totalExams: number;
  averageScore: number;
  totalHours: number;
  subjects?: Array<{ name: string; score: number }>;
}

interface CBTResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  duration?: number;
}

export default function ParentProgressPage() {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [recentResults, setRecentResults] = useState<CBTResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  async function fetchProgressData() {
    try {
      setLoading(true);
      setError(null);
      const [performanceRes, resultsRes] = await Promise.allSettled([
        api.getPerformance(),
        api.getCBTResults(1),
      ]);

      if (performanceRes.status === 'fulfilled') {
        setPerformance(performanceRes.value.data);
      }
      if (resultsRes.status === 'fulfilled') {
        const data = resultsRes.value.data;
        setRecentResults(Array.isArray(data) ? data.slice(0, 10) : (data?.results || []).slice(0, 10));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch progress data');
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
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={fetchProgressData} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Progress</h1>
        <p className="text-gray-600 mt-1">Track your child&apos;s academic performance</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance?.totalExams || 0}</p>
              <p className="text-xs text-gray-500">Exams Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance?.averageScore || 0}%</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance?.subjects?.length || 0}</p>
              <p className="text-xs text-gray-500">Subjects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance?.totalHours || 0}</p>
              <p className="text-xs text-gray-500">Study Hours</p>
            </div>
          </div>
        </div>
      </div>

      {performance?.subjects && performance.subjects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h2>
          <div className="space-y-3">
            {performance.subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{subject.name}</span>
                <span className={`font-bold ${getScoreColor(subject.score)} px-3 py-1 rounded-lg`}>
                  {subject.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h2>
        {recentResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results yet</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResults.map((result) => (
              <div key={result.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{result.subject}</h3>
                  <span className={`font-bold ${getScoreColor(result.score)} px-2 py-1 rounded-lg`}>
                    {result.score}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(result.completedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {result.correctAnswers}/{result.totalQuestions} correct
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
