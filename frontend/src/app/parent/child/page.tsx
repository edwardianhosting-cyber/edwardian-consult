'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, School, GraduationCap, Target, Calendar } from 'lucide-react';
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
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  state?: string;
  lga?: string;
  currentSchool?: string;
  classLevel?: string;
  programme?: string;
  examTypes?: string[];
  jambSubjects?: string[];
  targetInstitution?: string;
  targetCourse?: string;
  targetScore?: string;
  admissionYear?: string;
}

export default function ParentChildPage() {
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
        dateOfBirth: data?.dateOfBirth,
        gender: data?.gender,
        address: data?.address,
        state: data?.state,
        lga: data?.lga,
        currentSchool: data?.currentSchool || '',
        classLevel: data?.classLevel || '',
        programme: data?.programme || '',
        examTypes: (data?.examTypes as string[]) || [],
        jambSubjects: (data?.jambSubjects as string[]) || [],
        targetInstitution: data?.targetInstitution || '',
        targetCourse: data?.targetCourse || '',
        targetScore: data?.targetScore || '',
        admissionYear: data?.admissionYear || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load child profile');
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
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-medium text-gray-900 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {value || '—'}
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Child Profile</h1>
        <p className="text-gray-600 mt-1">View your child&apos;s academic and personal information</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
            <p className="text-gray-500">{profile.portalId}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                {profile.programme || 'No programme'}
              </span>
              {profile.studentEmail && (
                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {profile.studentEmail}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          Personal Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Full Name" value={profile.fullName} icon={User} />
          <InfoRow label="Email" value={profile.email} icon={Mail} />
          <InfoRow label="Phone" value={profile.phone} icon={Phone} />
          <InfoRow label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ''} icon={Calendar} />
          <InfoRow label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''} icon={User} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Contact & Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <InfoRow label="Address" value={profile.address} icon={MapPin} />
          </div>
          <InfoRow label="State" value={profile.state} icon={MapPin} />
          <InfoRow label="LGA" value={profile.lga} icon={MapPin} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <School className="w-5 h-5 text-primary-600" />
          Academic Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Current School" value={profile.currentSchool} icon={School} />
          <InfoRow label="Class Level" value={profile.classLevel} icon={School} />
          <InfoRow label="Programme" value={profile.programme} icon={GraduationCap} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary-600" />
          Examination & Targets
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Target Institution" value={profile.targetInstitution} icon={Target} />
          <InfoRow label="Target Course" value={profile.targetCourse} icon={Target} />
          <InfoRow label="Target Score" value={profile.targetScore} icon={Target} />
          <InfoRow label="Admission Year" value={profile.admissionYear} icon={Calendar} />
        </div>
      </div>
    </div>
  );
}
