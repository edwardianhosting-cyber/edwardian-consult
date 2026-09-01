'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList, Award, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface TeacherStats {
  totalStudents: number;
  totalAssignments: number;
  pendingGrading: number;
  totalCBTs: number;
  averageClassScore: number;
  upcomingClasses: any[];
  recentSubmissions: any[];
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalAssignments: 0,
    pendingGrading: 0,
    totalCBTs: 0,
    averageClassScore: 0,
    upcomingClasses: [],
    recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  async function fetchTeacherStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTeacherStats();
      if (data?.success && data.data) {
        setStats({
          totalStudents: data.data.totalStudents || 0,
          totalAssignments: data.data.totalAssignments || 0,
          pendingGrading: data.data.pendingGrading || 0,
          totalCBTs: data.data.totalCBTs || 0,
          averageClassScore: data.data.averageClassScore || 0,
          upcomingClasses: data.data.upcomingClasses || [],
          recentSubmissions: data.data.recentSubmissions || [],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your students and track their progress</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              <p className="text-xs text-gray-500">Assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
              <p className="text-xs text-gray-500">Pending Grading</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCBTs}</p>
              <p className="text-xs text-gray-500">CBTs Created</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageClassScore}%</p>
              <p className="text-xs text-gray-500">Avg. Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/teacher/assignments"
          className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
        >
          <Plus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Create Assignment</p>
        </Link>
        <Link
          href="/teacher/questions"
          className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
        >
          <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Add Questions</p>
        </Link>
        <Link
          href="/teacher/cbt"
          className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
        >
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Create CBT</p>
        </Link>
        <Link
          href="/teacher/attendance"
          className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
        >
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Mark Attendance</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/teacher/assignments" className="text-sm text-purple-600 hover:text-purple-700">
              View All
            </Link>
          </div>
          {stats.recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSubmissions.map((submission: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">
                        {submission.student?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{submission.student}</p>
                      <p className="text-xs text-gray-500">{submission.assignment}</p>
                      <p className="text-xs text-gray-400">{submission.submitted}</p>
                    </div>
                  </div>
                  {submission.status === 'graded' ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Graded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
            <Link href="/teacher/courses" className="text-sm text-purple-600 hover:text-purple-700">
              View Schedule
            </Link>
          </div>
          {stats.upcomingClasses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming classes</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingClasses.map((classItem: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{classItem.subject}</p>
                      <p className="text-xs text-gray-500">Class {classItem.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{classItem.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student Performance Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-sm text-green-700">Excellent (80%+)</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">20</p>
            <p className="text-sm text-blue-700">Good (60-79%)</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">10</p>
            <p className="text-sm text-yellow-700">Average (50-59%)</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">3</p>
            <p className="text-sm text-red-700">Below Average (&lt;50%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
