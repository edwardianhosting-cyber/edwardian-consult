'use client';

import { useEffect, useState } from 'react';
import { Shield, Phone, User, Mail, BookOpen } from 'lucide-react';
import api from '@/lib/api';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  parentPhone?: string;
  portalId: string;
  role: string;
  studentEmail?: string;
  programme?: string;
  classLevel?: string;
  currentSchool?: string;
}

export default function ParentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProfile();
      const data = (res as any).data || res;
      setProfile({
        id: data?.id || '',
        fullName: data?.fullName || '',
        email: data?.email || data?.studentEmail || '',
        phone: data?.phone || '',
        parentPhone: data?.parentPhone || '',
        portalId: data?.portalId || '',
        role: data?.role || 'PARENT_VIEW',
        studentEmail: data?.studentEmail,
        programme: data?.programme || '',
        classLevel: data?.classLevel || '',
        currentSchool: data?.currentSchool || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {value || '—'}
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Parent/Guardian access details</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Parent Portal</h2>
            <p className="text-gray-500">{profile.portalId}</p>
            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full mt-1">
              {profile.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Child Name" value={profile.fullName} icon={User} />
          <InfoRow label="Portal ID" value={profile.portalId} icon={Shield} />
          <InfoRow label="Programme" value={profile.programme || '—'} icon={BookOpen} />
          <InfoRow label="Class Level" value={profile.classLevel || '—'} icon={BookOpen} />
          <InfoRow label="Current School" value={profile.currentSchool || '—'} icon={BookOpen} />
          <InfoRow label="Student Email" value={profile.studentEmail || '—'} icon={Mail} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Parent Phone Number" value={profile.parentPhone || 'Not provided'} icon={Phone} />
          <InfoRow label="Student Phone" value={profile.phone} icon={Phone} />
        </div>
      </div>
    </div>
  );
}
