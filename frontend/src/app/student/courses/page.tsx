'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Settings, AlertCircle, Info } from 'lucide-react';
import api from '@/lib/api';

const EXAM_TYPE_OPTIONS = [
  { value: 'JAMB', label: 'JAMB' },
  { value: 'POST_UTME', label: 'Post-UTME' },
  { value: 'WAEC', label: 'WAEC' },
  { value: 'NECO', label: 'NECO' },
  { value: 'JUPEB', label: 'JUPEB' },
  { value: 'IJMB', label: 'IJMB' },
];

function getMaxForProgramme(programme: string | null | undefined, examTypes: string[] = []): number {
  const types = examTypes.map((t) => t.toUpperCase());
  const prog = (programme || '').toUpperCase();
  if (
    types.includes('JAMB') ||
    types.includes('POST_UTME') ||
    prog === 'JAMB' ||
    prog === 'POST-UTME' ||
    prog === 'POST_UTME'
  ) {
    return 4;
  }
  if (types.includes('WAEC') || types.includes('NECO') || prog === 'WAEC' || prog === 'NECO') {
    return 9;
  }
  return 9;
}

function programmeLabelFor(programme: string | null | undefined, examTypes: string[] = []): string {
  const max = getMaxForProgramme(programme, examTypes);
  if (max === 4) return 'JAMB / Post-UTME (max 4 subjects)';
  return "O'Level — WAEC / NECO / JUPEB / IJMB (max 9 subjects)";
}

export default function CoursesPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [programme, setProgramme] = useState<string>('');
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maxSubjects = useMemo(
    () => getMaxForProgramme(programme, examTypes),
    [programme, examTypes]
  );
  const programmeLabel = useMemo(
    () => programmeLabelFor(programme, examTypes),
    [programme, examTypes]
  );
  const isJambLike = maxSubjects === 4;

  useEffect(() => {
    fetchProfile();
    fetchSubjects();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.getProfile();
      const data = (res as any).data || res;
      setProgramme(data?.programme || '');
      setExamTypes((data?.examTypes as string[]) || []);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubjects() {
    try {
      setError(null);
      const res = await api.getMySubjects();
      const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
      setSubjects(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  const availableSubjects = COMMON_SUBJECTS.filter(
    (s) => !Array.isArray(subjects) || !subjects.includes(s)
  );
  const atLimit = subjects.length >= maxSubjects;

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

      {/* Subject-limit info banner */}
      <div
        className={`rounded-xl p-4 flex items-start gap-3 border ${
          subjects.length >= maxSubjects
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}
      >
        {subjects.length >= maxSubjects ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        )}
        <div className="text-sm">
          <p className="font-medium">
            {subjects.length >= maxSubjects
              ? `You have reached the maximum of ${maxSubjects} subject${
                  maxSubjects === 1 ? '' : 's'
                } for ${
                  isJambLike ? 'JAMB / Post-UTME' : "O'Level (WAEC / NECO)"
                }.`
              : `You can register up to ${maxSubjects} subject${
                  maxSubjects === 1 ? '' : 's'
                } for ${
                  isJambLike ? 'JAMB / Post-UTME' : "O'Level (WAEC / NECO)"
                }.`}
          </p>
          <p className="mt-1 text-xs">
            {isJambLike
              ? 'JAMB UTME requires exactly 4 subjects (English Language is compulsory, plus 3 others). Post-UTME screening uses the same combination.'
              : "O'Level (WAEC / NECO) candidates may register up to 9 subjects."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Subject count / progress */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{subjects.length}</span> / {maxSubjects}{' '}
          subject{subjects.length === 1 ? '' : 's'} registered
        </p>
        {subjects.length > maxSubjects && (
          <p className="text-sm text-red-600 font-medium">
            You have more subjects than allowed. Please remove {subjects.length - maxSubjects}.
          </p>
        )}
      </div>

      {/* Subject list */}
      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No subjects registered</p>
          <p className="text-gray-400 text-sm mt-1">
            Use the button above to choose your exam type and register subjects.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{subject}</h3>
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
