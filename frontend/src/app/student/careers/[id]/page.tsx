'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Briefcase, BookOpen, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

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
}

export default function CareerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCareer();
    }
  }, [id]);

  async function fetchCareer() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCareer(id);
      if (data.data) {
        const career = {
          ...data.data,
          requiredSubjects: Array.isArray(data.data.requiredSubjects) ? data.data.requiredSubjects : (data.data.requiredSubjects ? JSON.parse(data.data.requiredSubjects) : []),
          relatedCourses: Array.isArray(data.data.relatedCourses) ? data.data.relatedCourses : (data.data.relatedCourses ? JSON.parse(data.data.relatedCourses) : []),
        };
        setCareer(career);
      } else {
        setError('Career not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch career details');
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

  if (error || !career) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Career Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The career you are looking for does not exist.'}</p>
          <Link href="/student/careers" className="text-primary-600 hover:underline">
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/student/careers"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Careers
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{career.title}</h1>
            <p className="text-gray-600 mt-2 text-lg">{career.description}</p>
          </div>
        </div>

        {career.overview && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Overview</h2>
            <p className="text-gray-700 leading-relaxed">{career.overview}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {career.requirements && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Requirements
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{career.requirements}</p>
            </div>
          )}

          {career.skills && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Key Skills
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{career.skills}</p>
            </div>
          )}
        </div>

        {career.suitability && (
          <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-yellow-600" />
              Is This Career Right For You?
            </h3>
            <p className="text-gray-700 leading-relaxed">{career.suitability}</p>
          </div>
        )}

        {career.workEnvironment && (
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 mb-2">Work Environment</h3>
            <p className="text-gray-700">{career.workEnvironment}</p>
          </div>
        )}

        {career.salaryRange && (
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 mb-2">Salary Range</h3>
            <p className="text-green-700 font-medium">{career.salaryRange}</p>
          </div>
        )}

        {career.growthProspect && (
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 mb-2">Growth Prospect</h3>
            <p className="text-gray-700">{career.growthProspect}</p>
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-bold text-gray-900 mb-3">Required Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {career.requiredSubjects.map((subject, i) => (
              <span key={i} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                {subject}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            Related Courses
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {career.relatedCourses.map((course, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                <BookOpen className="w-4 h-4 text-primary-500 flex-shrink-0" />
                {course}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
