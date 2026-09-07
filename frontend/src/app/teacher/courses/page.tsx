'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Loader2, Users, AlertCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Subject {
  id: string;
  name: string;
  examType?: string;
  description?: string;
}

interface TeacherStatsData {
  totalStudents?: number;
  totalAssignments?: number;
  pendingGrading?: number;
  totalCBTs?: number;
  averageClassScore?: number;
  examTypes?: string[];
  upcomingClasses?: any[];
  recentSubmissions?: any[];
}

export default function TeacherCourses() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<TeacherStatsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [statsData, mySubjectsData] = await Promise.all([
        api.getTeacherStats(),
        api.getMySubjects(),
      ]);

      if (statsData?.success && statsData.data) {
        setStats(statsData.data);
      }

      if (mySubjectsData?.success && mySubjectsData.data) {
        const raw = mySubjectsData.data;
        if (Array.isArray(raw)) {
          setSubjects(raw.map((name: string, idx: number) => ({ id: String(idx), name, examType: name })));
        } else if (raw.subjects && Array.isArray(raw.subjects)) {
          setSubjects(raw.subjects.map((name: string, idx: number) => ({ id: String(idx), name, examType: name })));
        } else if (typeof raw === 'object' && raw !== null) {
          const entries = Object.entries(raw).map(([key, val]: [string, any]) => ({
            id: key,
            name: val?.name || val?.title || key,
            examType: val?.examType || val?.type || key,
          }));
          if (entries.length > 0) setSubjects(entries);
        }
      }

      if (statsData?.success && statsData.data?.examTypes) {
        const examTypes = statsData.data.examTypes;
        if (Array.isArray(examTypes) && examTypes.length > 0) {
          setSubjects((prev) => {
            if (prev.length > 0) return prev;
            return examTypes.map((name: string, idx: number) => ({ id: String(idx), name, examType: name }));
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
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

  const subjectList = subjects.length > 0 ? subjects : (stats.examTypes || []).map((name: string, idx: number) => ({ id: String(idx), name, examType: name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-1">Subjects and classes you are teaching</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subjectList.length}</p>
              <p className="text-xs text-gray-500">Subjects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents ?? 0}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
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
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading ?? 0}</p>
              <p className="text-xs text-gray-500">Pending Grading</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      {subjectList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No subjects assigned yet</p>
          <p className="text-gray-400 text-sm mt-1">Subjects will appear here once assigned to you</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectList.map((subject) => (
            <div key={subject.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{subject.name}</h3>
                  {subject.examType && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                      {subject.examType}
                    </span>
                  )}
                  {(subject as Subject).description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{(subject as Subject).description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
