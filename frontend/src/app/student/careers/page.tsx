'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Briefcase, Search } from 'lucide-react';

interface Career {
  id: string;
  title: string;
  description: string;
  requiredSubjects: string[];
  relatedCourses: string[];
  overview?: string;
  requirements?: string;
  skills?: string;
  workEnvironment?: string;
  salaryRange?: string;
  growthProspect?: string;
  suitability?: string;
  matchPercent?: number;
  matchedSubjects?: string[];
}

export default function CareersPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCareers();
    fetchUserSubjects();
  }, []);

  async function fetchCareers() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCareers();
      const careers = (data.data || []).map((c: any) => ({
        ...c,
        requiredSubjects: Array.isArray(c.requiredSubjects) ? c.requiredSubjects : (c.requiredSubjects ? JSON.parse(c.requiredSubjects) : []),
        relatedCourses: Array.isArray(c.relatedCourses) ? c.relatedCourses : (c.relatedCourses ? JSON.parse(c.relatedCourses) : []),
      }));
      setCareers(careers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch careers');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserSubjects() {
    try {
      const data = await api.getMySubjects();
      setUserSubjects(data || []);
    } catch (error) {
      console.error('Failed to fetch user subjects:', error);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserSubjects(user.jambSubjects || []);
      }
    }
  }

  async function matchCareers() {
    if (userSubjects.length === 0) return;

    try {
      const data = await api.matchCareers(userSubjects);
      const careers = (data.data || []).map((c: any) => ({
        ...c,
        requiredSubjects: Array.isArray(c.requiredSubjects) ? c.requiredSubjects : (c.requiredSubjects ? JSON.parse(c.requiredSubjects) : []),
        relatedCourses: Array.isArray(c.relatedCourses) ? c.relatedCourses : (c.relatedCourses ? JSON.parse(c.relatedCourses) : []),
      }));
      setCareers(careers);
    } catch (err: any) {
      alert(err.message || 'Failed to match careers');
    }
  }

  const filtered = careers.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Career Guidance</h1>
          <p className="text-gray-600 mt-1">Discover careers that match your interests</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchCareers}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Career Guidance</h1>
        <p className="text-gray-600 mt-1">Discover careers that match your interests</p>
      </div>

      {userSubjects.length > 0 && (
        <div className="bg-primary-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium">Your JAMB Subjects:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {userSubjects.map((subject, i) => (
                  <span key={i} className="bg-white text-primary-700 px-3 py-1 rounded-full text-sm">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={matchCareers}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              Match Careers
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search careers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No careers found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          filtered.map((career) => (
            <div
              key={career.id}
              onClick={() => router.push(`/student/careers/${career.id}`)}
              className="bg-white rounded-xl border border-gray-100 p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{career.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{career.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {career.requiredSubjects.slice(0, 4).map((subject, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
