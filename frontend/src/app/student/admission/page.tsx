'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { GraduationCap, CheckCircle, Clock, ExternalLink, AlertCircle, MapPin } from 'lucide-react';

interface AdmissionHubItem {
  institution: {
    name: string;
    abbreviation?: string;
    type: string;
    location?: string;
    state?: string;
  };
  course: string;
  utmeCutoff?: number;
  applicationFee?: number;
  deadline?: string;
  postUtmeRequired: boolean;
  postUtmeCutoff?: number;
}

export default function AdmissionPage() {
  const [hubItems, setHubItems] = useState<AdmissionHubItem[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [hubRes, trackerRes, announcementsRes] = await Promise.allSettled([
        api.getAdmissionHub(),
        api.getAdmissionStatus(),
        api.getAdmissionAnnouncements(),
      ]);

      if (hubRes.status === 'fulfilled') {
        setHubItems((hubRes.value as any).data || []);
      }
      if (trackerRes.status === 'fulfilled') {
        const tracker = (trackerRes.value as any).data;
        setApplications(tracker?.applications || []);
      }
      if (announcementsRes.status === 'fulfilled') {
        setAnnouncements((announcementsRes.value as any).data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admission data');
    } finally {
      setLoading(false);
    }
  }

  async function updateApplicationStatus(id: string, status: string) {
    try {
      await api.updateMyApplicationStatus(id, status);
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status } : app)
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
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
          <h1 className="text-2xl font-bold text-gray-900">Admission Hub</h1>
          <p className="text-gray-600 mt-1">Your admission status and next steps</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchData}
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
        <h1 className="text-2xl font-bold text-gray-900">Admission Hub</h1>
        <p className="text-gray-600 mt-1">Schools still offering admission and your applications</p>
      </div>

      {/* Schools Still Offering Admission */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schools Still Offering Admission</h2>
        {hubItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active admission offers found for your course</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {hubItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.institution.name}</h3>
                    {item.institution.abbreviation && (
                      <p className="text-sm text-gray-500">({item.institution.abbreviation})</p>
                    )}
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Open</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Course:</span>
                    <span className="font-medium text-gray-900">{item.course}</span>
                  </div>
                  {item.utmeCutoff && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">UTME Cutoff:</span>
                      <span className="font-medium text-gray-900">{item.utmeCutoff}</span>
                    </div>
                  )}
                  {item.applicationFee && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Application Fee:</span>
                      <span className="font-medium text-gray-900">₦{item.applicationFee.toLocaleString()}</span>
                    </div>
                  )}
                  {item.deadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-medium text-gray-900">{new Date(item.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {item.postUtmeRequired && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Post-UTME:</span>
                      <span className="text-gray-900">Required {item.postUtmeCutoff && `(${item.postUtmeCutoff}%)`}</span>
                    </div>
                  )}
                </div>
                <button className="mt-4 w-full py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admission Announcements */}
      {announcements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admission News & Updates</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {announcements.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                {item.coverImage && (
                  <img src={item.coverImage} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{item.category}</span>
                  {item.isPinned && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pinned</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{item.excerpt || item.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Applications */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h2>
        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No applications yet</p>
            <p className="text-gray-400 text-sm mt-1">Start by applying to institutions above</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-semibold text-gray-600">
              <div className="col-span-1">Choice</div>
              <div className="col-span-4">Institution</div>
              <div className="col-span-3">Course</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Action</div>
            </div>
            {applications.map((app) => (
              <div key={app.id} className="grid grid-cols-12 gap-4 p-4 items-center border-t border-gray-50">
                <div className="col-span-1">
                  <span className="font-semibold text-gray-900">#{app.choiceNumber || '-'}</span>
                </div>
                <div className="col-span-4">
                  <p className="font-medium text-gray-900 text-sm">{app.institution}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-gray-600">{app.course}</p>
                </div>
                <div className="col-span-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded border ${
                      app.status === 'ADMITTED' ? 'bg-green-50 text-green-700 border-green-200' :
                      app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                      app.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="ADMITTED">Admitted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium ${
                    app.status === 'ADMITTED' ? 'text-green-600' :
                    app.status === 'REJECTED' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
