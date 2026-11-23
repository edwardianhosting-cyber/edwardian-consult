'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Settings } from 'lucide-react';
import api from '@/lib/api';

interface SubjectItem {
  id: string;
  title: string;
  subject: string;
  type: string;
  description?: string;
  fileUrl?: string;
  createdAt: string;
}

export default function CoursesPage() {
  const [materials, setMaterials] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      setError(null);
      const res = await api.getMySubjects();
      const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
      const mapped: SubjectItem[] = list.map((name: string) => ({
        id: name,
        title: name,
        subject: name,
        type: 'SUBJECT',
        createdAt: new Date().toISOString(),
      }));
      setMaterials(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-1">Subjects registered for your current programme</p>
        </div>
        <Link
          href="/student/settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Settings className="w-4 h-4" />
          Change Exam Type & Subjects
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No subjects registered</p>
          <p className="text-gray-400 text-sm mt-1">
            Use the button above to choose your exam type and register subjects.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500">Registered</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
