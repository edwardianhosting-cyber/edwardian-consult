'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, FileText, Award, CreditCard, Calendar, Activity } from 'lucide-react';
import api from '@/lib/api';
import Chart from '@/components/Chart';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalQuestions: number;
  totalExams: number;
  totalRevenue: number;
  revenueThisMonth: number;
  recentResults: number;
}

interface TimeSeriesData {
  date: string;
  students: number;
  exams: number;
  revenue: number;
}

export default function AdminAnalyticsPage() {
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTimeSeries();
  }, [timeRange]);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAnalyticsStats();
      const payload = (data as any)?.data || data || {};
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        totalQuestions: 0,
        totalExams: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        recentResults: 0,
        ...payload,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTimeSeries() {
    try {
      const data = await api.getAnalyticsTimeSeries(timeRange);
      const payload = (data as any)?.data || data || [];
      setTimeSeriesData(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      console.error('Failed to fetch analytics timeseries:', err);
      setTimeSeriesData([]);
    }
  }

  const features = [
    { title: 'Student Analytics', description: 'Track student enrollment, activity, and performance trends over time.', icon: Users },
    { title: 'Exam Performance', description: 'Monitor exam completion rates, average scores, and question difficulty analysis.', icon: Award },
    { title: 'Revenue Tracking', description: 'View revenue trends, payment methods, and financial forecasting.', icon: CreditCard },
    { title: 'Question Bank Insights', description: 'Analyze question distribution by subject, difficulty, and exam type.', icon: FileText },
    { title: 'Real-time Dashboard', description: 'Live updates on platform activity, user engagement, and system health.', icon: Activity },
    { title: 'Export Reports', description: 'Generate and download detailed analytics reports in PDF and CSV formats.', icon: TrendingUp },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Platform Activity
          </h2>
          <Chart
            spec={JSON.stringify({
              type: 'line',
              data: {
                labels: timeSeriesData.map(d => d.date),
                datasets: [
                  {
                    label: 'Students',
                    data: timeSeriesData.map(d => d.students),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: 'Exams',
                    data: timeSeriesData.map(d => d.exams),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              },
            })}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            Revenue Overview
          </h2>
          <Chart
            spec={JSON.stringify({
              type: 'bar',
              data: {
                labels: timeSeriesData.map(d => d.date),
                datasets: [
                  {
                    label: 'Revenue (₦)',
                    data: timeSeriesData.map(d => Math.round(d.revenue)),
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: '#F59E0B',
                    borderWidth: 1,
                    borderRadius: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value: any) {
                        return '₦' + Number(value).toLocaleString();
                      },
                    },
                  },
                },
              },
            })}
          />
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
