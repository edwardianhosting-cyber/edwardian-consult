'use client';

import { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, School, Calendar, Camera, Loader2, Lock, GraduationCap, Target } from 'lucide-react';
import api from '@/lib/api';
import { JAMB_SUBJECTS, WAEC_NECO_SUBJECTS } from '@/lib/subjects';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  portalId: string;
  role: string;
  studentEmail?: string;
  avatar?: string;
  address: string;
  state: string;
  lga: string;
  currentSchool: string;
  classLevel: string;
  programme: string;
  examTypes: string[];
  jambSubjects: string[];
  olevelResults: string[];
  targetScore: string;
  targetInstitution: string;
  targetCourse: string;
  secondChoiceInstitution: string;
  secondChoiceCourse: string;
  admissionYear: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await api.getProfile();
      const data = (res as any).data || res;
      setProfile({
        fullName: data?.fullName || '',
        email: data?.email || data?.studentEmail || '',
        phone: data?.phone || '',
        dateOfBirth: data?.dateOfBirth ? String(data.dateOfBirth).split('T')[0] : '',
        gender: data?.gender || '',
        portalId: data?.portalId || '',
        role: data?.role || 'STUDENT',
        studentEmail: data?.studentEmail,
        avatar: data?.avatar,
        address: data?.address || '',
        state: data?.state || '',
        lga: data?.lga || '',
        currentSchool: data?.currentSchool || '',
        classLevel: data?.classLevel || '',
        programme: data?.programme || '',
        examTypes: (data?.examTypes as string[]) || [],
        jambSubjects: (data?.jambSubjects as string[]) || [],
        olevelResults: (data?.olevelResults as string[]) || [],
        targetScore: data?.targetScore || '',
        targetInstitution: data?.targetInstitution || '',
        targetCourse: data?.targetCourse || '',
        secondChoiceInstitution: data?.secondChoiceInstitution || '',
        secondChoiceCourse: data?.secondChoiceCourse || '',
        admissionYear: data?.admissionYear || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadAvatar(file);
      const updated = (res as any).data || res;
      setProfile((prev) => prev ? { ...prev, avatar: updated.avatar } : prev);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-medium text-gray-900">{value || '—'}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          View your personal information. To update your details, visit Settings.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.fullName} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {profile.fullName?.charAt(0) || 'S'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
            <p className="text-gray-500">{profile.portalId}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                {profile.programme || 'No programme selected'}
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

      {/* Personal Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          Personal Details
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          These details are locked. To change them, please contact the registrar.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Full Name" value={profile.fullName} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone Number" value={profile.phone} />
          <InfoRow
            label="Date of Birth"
            value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ''}
          />
          <InfoRow label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''} />
        </div>
      </div>

      {/* Contact & Location */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Contact & Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <InfoRow label="Address" value={profile.address} />
          </div>
          <InfoRow label="State" value={profile.state} />
          <InfoRow label="LGA" value={profile.lga} />
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <School className="w-5 h-5 text-primary-600" />
          Academic Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Current School" value={profile.currentSchool} />
          <InfoRow label="Class Level" value={profile.classLevel} />
          <InfoRow label="Primary Programme" value={profile.programme} />
        </div>
      </div>

      {/* Examination Type & Subjects */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary-600" />
          Examination Type & Subjects
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Exam Types</p>
            <div className="flex flex-wrap gap-2">
              {profile.examTypes.length > 0 ? (
                profile.examTypes.map((type) => (
                  <span key={type} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg border border-primary-100">
                    {type.replace('_', ' ')}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No exam types selected</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">JAMB / Post-UTME Subjects</p>
            <div className="flex flex-wrap gap-2">
              {profile.jambSubjects.length > 0 ? (
                profile.jambSubjects.map((subject) => (
                  <span key={subject} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                    {subject}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No JAMB subjects selected</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">O&apos;Level (WAEC / NECO) Subjects</p>
            <div className="flex flex-wrap gap-2">
              {profile.olevelResults.length > 0 ? (
                profile.olevelResults.map((subject) => (
                  <span key={subject} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                    {subject}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No O&apos;Level subjects selected</span>
              )}
            </div>
          </div>
          <InfoRow label="Target Score" value={profile.targetScore} />
        </div>
      </div>

      {/* Target Institution & Course */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          Target Institution & Course
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="First Choice Institution" value={profile.targetInstitution} />
          <InfoRow label="First Choice Course" value={profile.targetCourse} />
          <InfoRow label="Second Choice Institution" value={profile.secondChoiceInstitution} />
          <InfoRow label="Second Choice Course" value={profile.secondChoiceCourse} />
          <InfoRow label="Admission Year" value={profile.admissionYear} />
        </div>
      </div>
    </div>
  );
}
