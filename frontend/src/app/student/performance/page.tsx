'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Target, TrendingUp, Award, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';

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

export default function PerformancePage() {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  async function fetchPerformance() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPerformance();
      setPerformance(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !performance || performance.totalCBTs === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Performance Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered insights into your learning</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No performance data yet</p>
          <p className="text-gray-400 text-sm mt-1">Complete CBTs to see your performance analysis</p>
          <a
            href="/student/cbt"
            className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Start CBT Practice
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Performance Analysis</h1>
        <p className="text-gray-600 mt-1">AI-powered insights into your learning</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance.totalCBTs}</p>
              <p className="text-sm text-gray-500">Total CBTs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance.averageScore}%</p>
              <p className="text-sm text-gray-500">Overall Average</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance.practiceAverageScore}%</p>
              <p className="text-sm text-gray-500">Practice Average</p>
              <p className="text-xs text-gray-400">{performance.practiceCBTs} exams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{performance.mockAverageScore}%</p>
              <p className="text-sm text-gray-500">Mock Average</p>
              <p className="text-xs text-gray-400">{performance.mockCBTs} exams</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Strengths
          </h2>
          {performance.strengths.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Complete more CBTs to identify strengths</p>
          ) : (
            <div className="space-y-3">
              {performance.strengths.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">{item.subject}</span>
                  <span className="text-green-600 font-bold">{item.average}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Needs Improvement
          </h2>
          {performance.weaknesses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Great! No weak areas identified</p>
          ) : (
            <div className="space-y-3">
              {performance.weaknesses.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-900">{item.subject}</span>
                  <span className="text-red-600 font-bold">{item.average}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {performance.recommendations.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Study Plan</h2>
          <div className="space-y-2">
            {performance.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                <ChevronRight className="w-4 h-4 text-primary-600" />
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {performance.progressOverTime.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h2>
          <div className="h-48 flex items-end gap-1">
            {performance.progressOverTime.slice(-20).map((point, index) => (
              <div
                key={index}
                className="flex-1 bg-primary-200 rounded-t hover:bg-primary-400 transition-colors relative group"
                style={{ height: `${point.score}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {point.subject}: {Math.round(point.score)}% ({point.type})
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>First CBT</span>
            <span>Recent</span>
          </div>
        </div>
      )}
    </div>
  );
}
