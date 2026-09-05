'use client';

import { useEffect, useState } from 'react';
import { Users, GraduationCap, CreditCard, FileText, TrendingUp, TrendingDown, BookOpen, Award, Clock, UserCheck, UserPlus, School, Bell } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalQuestions: number;
  totalExams: number;
  totalRevenue: number;
  revenueThisMonth: number;
  recentResults: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    recentResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStats();
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        totalQuestions: 0,
        totalExams: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        recentResults: 0,
        ...(data || {}),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
      link: '/admin/students',
    },
    {
      title: 'Active Students',
      value: stats.activeStudents,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase',
      link: '/admin/students',
    },
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+3%',
      changeType: 'increase',
      link: '/admin/questions',
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: '-5%',
      changeType: 'decrease',
      link: '/admin/payments',
      prefix: '₦',
    },
    {
      title: "This Month's Revenue",
      value: stats.revenueThisMonth,
      icon: CreditCard,
      color: 'bg-pink-500',
      change: '+18%',
      changeType: 'increase',
      link: '/admin/payments',
      prefix: '₦',
    },
    {
      title: 'Recent CBT Results',
      value: stats.recentResults,
      icon: Award,
      color: 'bg-indigo-500',
      change: '+24%',
      changeType: 'increase',
      link: '/admin/cbt',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the admin panel. Here&apos;s an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.link}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stat.prefix || ''}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/students"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <UserPlus className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Add Student</span>
            </Link>
            <Link
              href="/admin/teachers"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <GraduationCap className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Add Teacher</span>
            </Link>
            <Link
              href="/admin/questions"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Add Question</span>
            </Link>
            <Link
              href="/admin/programs"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Manage Programs</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Exams</span>
              <span className="text-sm font-bold text-gray-900">{stats.totalExams.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Questions</span>
              <span className="text-sm font-bold text-gray-900">{stats.totalQuestions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Revenue This Month</span>
              <span className="text-sm font-bold text-gray-900">₦{stats.revenueThisMonth.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
