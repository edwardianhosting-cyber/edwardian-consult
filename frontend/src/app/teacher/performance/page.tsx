'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Loader2, TrendingUp, Users, ClipboardList, Award, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface TeacherStatsData {
  totalStudents?: number;
  totalAssignments?: number;
  pendingGrading?: number;
  totalCBTs?: number;
  averageClassScore?: number;
  upcomingClasses?: any[];
  recentSubmissions?: any[];
}

export default function TeacherPerformance() {
  const [stats, setStats] = useState<TeacherStatsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTeacherStats();
      if (data?.success && data.data) {
        setStats(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const hasData = stats.totalStudents || stats.totalAssignments || stats.averageClassScore || stats.pendingGrading || stats.totalCBTs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Performance</h1>
        <p className="text-gray-600 mt-1">Track and analyze your class performance metrics</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {!hasData ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No performance data yet</p>
          <p className="text-gray-400 text-sm mt-1">Performance analytics will appear here once you have teaching activity</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents ?? 0}</p>
                  <p className="text-xs text-gray-500">Total Students</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments ?? 0}</p>
                  <p className="text-xs text-gray-500">Assignments</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCBTs ?? 0}</p>
                  <p className="text-xs text-gray-500">CBTs Created</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageClassScore ?? 0}%</p>
                  <p className="text-xs text-gray-500">Avg. Score</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading ?? 0}</p>
                  <p className="text-xs text-gray-500">Pending Grading</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-sm text-green-700">Excellent (80%+)</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">--</p>
                <p className="text-sm text-blue-700">Good (60-79%)</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">--</p>
                <p className="text-sm text-yellow-700">Average (50-59%)</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">--</p>
                <p className="text-sm text-red-700">Below Average (&lt;50%)</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Detailed score distribution breakdowns will appear here as more data is collected.
            </p>
          </div>

          {/* Recent Submissions */}
          {stats.recentSubmissions && stats.recentSubmissions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h2>
              <div className="space-y-3">
                {stats.recentSubmissions.slice(0, 5).map((submission: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{submission.student}</p>
                      <p className="text-xs text-gray-500">{submission.assignment}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      submission.status === 'graded'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {submission.status || 'pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
