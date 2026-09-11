'use client';

import { useEffect, useState } from 'react';
import { Target, TrendingUp, TrendingDown, BookOpen, Award, Loader2, BarChart3 } from 'lucide-react';
import api from '@/lib/api';
import { showError } from '@/lib/toast';

interface PerformanceData {
  totalCBTs: number;
  averageScore: number;
  practiceCBTs: number;
  practiceAverageScore: number;
  mockCBTs: number;
  mockAverageScore: number;
  strengths: { subject: string; average: number }[];
  weaknesses: { subject: string; average: number }[];
  recommendations: string[];
  progressOverTime: { date: string; score: number; subject: string; type: string }[];
}

interface AdminStats {
  totalExams: number;
  totalResults: number;
  publishedExams: number;
  draftExams: number;
}

export default function AdminPerformancePage() {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [perfRes, statsRes] = await Promise.all([
        api.getPerformance(),
        api.adminGetCBTStats(),
      ]);
      setPerformance(perfRes.data as PerformanceData);
      setStats(statsRes.data as AdminStats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600 mt-1">System-wide performance analytics</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchData} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        <p className="text-gray-600 mt-1">System-wide performance analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalExams || 0}</p>
              <p className="text-sm text-gray-500">Total Mock Exams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalResults || 0}</p>
              <p className="text-sm text-gray-500">Total Attempts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.publishedExams || 0}</p>
              <p className="text-sm text-gray-500">Published Exams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.draftExams || 0}</p>
              <p className="text-sm text-gray-500">Draft Exams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Performance Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Overview</h2>
        {!performance || performance.totalCBTs === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No performance data available yet</p>
            <p className="text-gray-400 text-sm mt-1">Data will appear once students complete exams</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(performance.averageScore)}%</p>
              <p className="text-xs text-gray-500 mt-1">Across all exams</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Practice CBTs</p>
              <p className="text-3xl font-bold text-gray-900">{performance.practiceCBTs}</p>
              <p className="text-xs text-gray-500 mt-1">Avg: {Math.round(performance.practiceAverageScore)}%</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Mock Exams</p>
              <p className="text-3xl font-bold text-gray-900">{performance.mockCBTs}</p>
              <p className="text-xs text-gray-500 mt-1">Avg: {Math.round(performance.mockAverageScore)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Strengths and Weaknesses */}
      {performance && performance.totalCBTs > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Strengths</h2>
            </div>
            {performance.strengths.length === 0 ? (
              <p className="text-sm text-gray-500">No strong subjects identified yet (score &gt;= 70%)</p>
            ) : (
              <div className="space-y-3">
                {performance.strengths.map((item) => (
                  <div key={item.subject} className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span className="font-medium text-gray-900">{item.subject}</span>
                    <span className="text-sm font-bold text-green-700">{item.average}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Weaknesses</h2>
            </div>
            {performance.weaknesses.length === 0 ? (
              <p className="text-sm text-gray-500">No weak subjects identified (all scores &gt;= 60%)</p>
            ) : (
              <div className="space-y-3">
                {performance.weaknesses.map((item) => (
                  <div key={item.subject} className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                    <span className="font-medium text-gray-900">{item.subject}</span>
                    <span className="text-sm font-bold text-red-700">{item.average}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {performance && performance.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-2">
            {performance.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Over Time */}
      {performance && performance.progressOverTime.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Progress</h2>
          <div className="space-y-2">
            {performance.progressOverTime.slice(-10).reverse().map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{item.subject}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString()} • {item.type === 'MOCK' ? 'Mock Exam' : 'CBT Practice'}
                  </p>
                </div>
                <span className={`text-sm font-bold ${item.score >= 70 ? 'text-green-600' : item.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {Math.round(item.score)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
