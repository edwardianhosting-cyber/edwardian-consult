'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Target, CheckCircle, Circle, Clock, Award } from 'lucide-react';

interface AdmissionTracker {
  timeline: {
    step: string;
    status: 'completed' | 'current' | 'pending';
  }[];
  applications: {
    id: string;
    institution: string;
    course: string;
    status: string;
    utmeScore?: number;
    submittedAt?: string;
    decisionAt?: string;
  }[];
}

export default function AdmissionTrackerPage() {
  const [tracker, setTracker] = useState<AdmissionTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTracker();
  }, []);

  async function fetchTracker() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdmissionStatus();
      setTracker(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracker');
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'current':
        return <Clock className="w-6 h-6 text-primary-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-primary-500 bg-primary-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admission Tracker</h1>
          <p className="text-gray-600 mt-1">Track your admission progress</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchTracker}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admission Tracker</h1>
        <p className="text-gray-600 mt-1">Track your admission progress</p>
      </div>

      {!tracker ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No admission data yet</p>
          <p className="text-gray-400 text-sm mt-1">Apply to institutions to track your progress</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Admission Timeline</h2>
            {tracker.timeline && tracker.timeline.length > 0 ? (
              <div className="relative">
                {tracker.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(item.status)}
                      {index < tracker.timeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${
                          item.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className={`flex-1 p-4 rounded-lg border-2 ${getStatusColor(item.status)}`}>
                      <p className={`font-medium ${
                        item.status === 'completed' ? 'text-green-700' :
                        item.status === 'current' ? 'text-primary-700' : 'text-gray-500'
                      }`}>
                        {item.step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No timeline steps available</p>
            )}
          </div>

          {tracker.applications && tracker.applications.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h2>
              <div className="space-y-4">
                {tracker.applications.map((app) => (
                  <div key={app.id} className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{app.institution}</h3>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{app.course}</p>
                    {app.utmeScore && (
                      <p className="text-sm text-gray-500 mt-1">UTME Score: {app.utmeScore}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <a
              href="/student/institutions"
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Find Institutions</h3>
                  <p className="text-sm text-gray-500">Match with schools</p>
                </div>
              </div>
            </a>
            <a
              href="/student/scholarships"
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Scholarships</h3>
                  <p className="text-sm text-gray-500">Find funding</p>
                </div>
              </div>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
