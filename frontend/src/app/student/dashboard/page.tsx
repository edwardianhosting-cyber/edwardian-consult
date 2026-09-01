'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Play,
  Bell,
  Target,
  School,
  User,
  Newspaper,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  studentEmail: string;
  portalId: string;
  programme: string;
  examTypes: string[];
  jambSubjects: string[];
  targetInstitution: string;
  targetCourse: string;
  classLevel: string;
  currentSchool: string;
  targetScore: string;
  state: string;
  gender: string;
  role: string;
  admissionYear: string;
}

interface DashboardStats {
  totalCBTs: number;
  averageScore: number;
  totalStudyHours: number;
  upcomingExams: number;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  category?: string;
  createdAt?: string;
}

interface AssignmentItem {
  id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  status?: string;
}

interface NoticeItem {
  id: string;
  title: string;
  message?: string;
  createdAt?: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCBTs: 0,
    averageScore: 0,
    totalStudyHours: 0,
    upcomingExams: 0,
  });
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [
        userRes,
        performanceRes,
        resultsRes,
        notificationsRes,
        newsRes,
        assignmentsRes,
        noticesRes,
      ] = await Promise.allSettled([
        api.getProfile(),
        api.getPerformance(),
        api.getCBTResults(1),
        api.getRecentNotifications(5),
        api.getNews(),
        api.getAssignments(),
        api.getNotices(),
      ]);

      if (userRes.status === 'fulfilled') {
        setUser(userRes.value.data);
      }
      if (performanceRes.status === 'fulfilled') {
        setStats({
          totalCBTs: performanceRes.value.data.totalExams || 0,
          averageScore: Math.round(performanceRes.value.data.averageScore || 0),
          totalStudyHours: performanceRes.value.data.totalHours || 0,
          upcomingExams: 0,
        });
      }
      if (resultsRes.status === 'fulfilled') {
        setRecentResults(resultsRes.value.data?.results || []);
      }
      if (notificationsRes.status === 'fulfilled') {
        setNotifications(notificationsRes.value.data || []);
      }
      if (newsRes.status === 'fulfilled') {
        setNews((newsRes.value.data || []).slice(0, 4));
      }
      if (assignmentsRes.status === 'fulfilled') {
        setAssignments((assignmentsRes.value.data || []).slice(0, 4));
      }
      if (noticesRes.status === 'fulfilled') {
        setNotices((noticesRes.value.data || []).slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isJambStudent = user.examTypes?.includes('JAMB');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user.fullName?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-primary-200 mb-4">
          {isJambStudent && `You're preparing for ${user.admissionYear || '2027'} JAMB UTME`}
          {user.targetInstitution && ` • Target: ${user.targetCourse} at ${user.targetInstitution}`}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/cbt"
            className="inline-flex items-center gap-2 bg-accent-500 text-primary-900 px-4 py-2 rounded-lg font-medium hover:bg-accent-400 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start CBT Practice
          </Link>
          <Link
            href="/student/materials"
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Study Materials
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/student/cbt" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCBTs}</p>
          <p className="text-sm text-gray-500">CBTs Completed</p>
        </Link>
        <Link href="/student/performance" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <Target className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
          <p className="text-sm text-gray-500">Average Score</p>
        </Link>
        <Link href="/student/study-planner" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStudyHours}h</p>
          <p className="text-sm text-gray-500">Study Hours</p>
        </Link>
        <Link href="/student/mock" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <Award className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.upcomingExams}</p>
          <p className="text-sm text-gray-500">Upcoming Exams</p>
        </Link>
      </div>

      {/* Dashboard Boxes Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent News */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary-600" />
              Recent News
            </h2>
            <Link href="/news" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {news.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No news yet</p>
            ) : (
              news.map((item) => (
                <Link
                  key={item.id}
                  href={`/news`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                  {item.excerpt && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
                  )}
                  {item.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-600" />
              Assignments
            </h2>
            <Link href="/student/assignments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No assignments yet</p>
            ) : (
              assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href="/student/assignments"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{assignment.title}</p>
                    {assignment.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        assignment.status === 'SUBMITTED'
                          ? 'bg-green-100 text-green-700'
                          : assignment.status === 'LATE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {assignment.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {assignment.subject && <span>{assignment.subject}</span>}
                    {assignment.dueDate && (
                      <>
                        <span>•</span>
                        <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              Notifications
            </h2>
            <Link href="/student/notifications" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No notifications yet</p>
            ) : (
              notifications.slice(0, 4).map((notif) => (
                <Link
                  key={notif.id}
                  href="/student/notifications"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${notif.isRead ? 'bg-gray-300' : 'bg-primary-600'}`} />
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{notif.title}</p>
                  </div>
                  {notif.message && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-600" />
                Recent Results
              </h2>
              <Link href="/student/results" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentResults.slice(0, 4).map((result) => (
                <Link
                  key={result.id}
                  href="/student/results"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-semibold text-primary-600">
                    {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Announcements / Notices */}
        {notices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-600" />
                Announcements
              </h2>
              <Link href="/student/notices" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  href="/student/notices"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{notice.title}</p>
                  {notice.message && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.message}</p>
                  )}
                  {notice.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/student/cbt" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
              <GraduationCap className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">CBT Practice</span>
            </Link>
            <Link href="/student/materials" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
              <BookOpen className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Study Materials</span>
            </Link>
            <Link href="/student/results" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
              <Award className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Results</span>
            </Link>
            <Link href="/student/profile" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
              <User className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
