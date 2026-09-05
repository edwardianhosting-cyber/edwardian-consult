'use client';

import { useEffect, useState } from 'react';
import { User, TrendingUp, Calendar, FileText, CreditCard, BookOpen, Award, Clock, CheckCircle, AlertCircle, Bell, Phone } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  portalId: string;
  programme: string;
  classLevel: string;
  avatar?: string;
  studentEmail?: string;
  examTypes?: string[];
  currentSchool?: string;
  targetInstitution?: string;
  targetCourse?: string;
  phone?: string;
  parentPhone?: string;
}

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

interface Assignment {
  id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  status?: string;
}

interface Notice {
  id: string;
  title: string;
  message?: string;
  createdAt?: string;
  isPinned?: boolean;
}

export default function ParentDashboard() {
  const [child, setChild] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ totalCBTs: 0, averageScore: 0, attendanceRate: 0, assignmentsCompleted: 0, totalAssignments: 0, pendingPayments: 0 });
  const [recentResults, setRecentResults] = useState<CBTResult[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, performanceRes, resultsRes, notificationsRes, assignmentsRes, noticesRes] = await Promise.allSettled([
        api.getProfile(),
        api.getPerformance(),
        api.getCBTResults(1),
        api.getRecentNotifications(5),
        api.getAssignments(),
        api.getNotices(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setChild(profileRes.value.data);
      }
      if (performanceRes.status === 'fulfilled') {
        const perf: PerformanceData = performanceRes.value.data;
        setStats(prev => ({
          ...prev,
          totalCBTs: perf.totalExams || 0,
          averageScore: Math.round(perf.averageScore || 0),
        }));
      }
      if (resultsRes.status === 'fulfilled') {
        const data = resultsRes.value.data;
        setRecentResults(Array.isArray(data) ? data.slice(0, 5) : (data?.results || []).slice(0, 5));
      }
      if (notificationsRes.status === 'fulfilled') {
        setNotifications(notificationsRes.value.data || []);
      }
      if (assignmentsRes.status === 'fulfilled') {
        setAssignments((assignmentsRes.value.data || []).slice(0, 5));
      }
      if (noticesRes.status === 'fulfilled') {
        setNotices((noticesRes.value.data || []).slice(0, 5));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
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
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={fetchDashboardData} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your child&apos;s academic progress</p>
      </div>

      {child && (
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{child.fullName}</h2>
              <p className="text-green-200">ID: {child.portalId}</p>
              <p className="text-green-200">{child.programme || 'Student'} {child.classLevel ? `• ${child.classLevel}` : ''}</p>
              {child.parentPhone && (
                <p className="text-green-200 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />
                  Parent Contact: {child.parentPhone}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCBTs}</p>
              <p className="text-xs text-gray-500">CBTs Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.assignmentsCompleted}/{stats.totalAssignments}</p>
              <p className="text-xs text-gray-500">Assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              <p className="text-xs text-gray-500">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent CBT Results</h2>
            <Link href="/parent/results" className="text-sm text-green-600 hover:text-green-700">View All</Link>
          </div>
          {recentResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No results yet</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${result.score >= 70 ? 'bg-green-100' : result.score >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                      <span className={`font-bold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {result.score}%
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{result.subject}</p>
                      <p className="text-xs text-gray-500">{new Date(result.completedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {result.score >= 70 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <Link href="/parent/notifications" className="text-sm text-green-600 hover:text-green-700">View All</Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${notif.isRead ? 'bg-gray-300' : 'bg-green-600'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{notif.title}</p>
                    {notif.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
            <Link href="/parent/assignments" className="text-sm text-green-600 hover:text-green-700">View All</Link>
          </div>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{assignment.title}</p>
                    <p className="text-xs text-gray-500">{assignment.subject} {assignment.dueDate && `• Due ${new Date(assignment.dueDate).toLocaleDateString()}`}</p>
                  </div>
                  {assignment.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${assignment.status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : assignment.status === 'LATE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {assignment.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
            <Link href="/parent/announcements" className="text-sm text-green-600 hover:text-green-700">View All</Link>
          </div>
          {notices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && <Bell className="w-4 h-4 text-yellow-500" />}
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{notice.title}</p>
                  </div>
                  {notice.message && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.message}</p>}
                  {notice.createdAt && <p className="text-xs text-gray-400 mt-1">{new Date(notice.createdAt).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/parent/child" className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Child Profile</p>
        </Link>
        <Link href="/parent/results" className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">CBT Results</p>
        </Link>
        <Link href="/parent/attendance" className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Attendance</p>
        </Link>
        <Link href="/parent/assignments" className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Assignments</p>
        </Link>
      </div>
    </div>
  );
}
