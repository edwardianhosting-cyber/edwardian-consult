'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, School, Calendar, Camera } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  studentEmail?: string;
  phone: string;
  portalId: string;
  programme?: string;
  classLevel?: string;
  currentSchool?: string;
  targetInstitution?: string;
  targetCourse?: string;
  targetScore?: string;
  state?: string;
  lga?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.data) {
        setUser(data.data);
        return;
      }
      throw new Error('Invalid response');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          // ignore parse error
        }
      }
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your personal information</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {user.fullName?.charAt(0) || 'S'}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
            <p className="text-gray-500">{user.portalId}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
              {user.programme || 'Student'}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{user.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          {user.studentEmail && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Student Email</p>
                <p className="font-medium text-gray-900">{user.studentEmail}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{user.phone}</p>
            </div>
          </div>
          {user.gender && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium text-gray-900">{user.gender}</p>
              </div>
            </div>
          )}
          {user.dateOfBirth && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {user.classLevel && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <School className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Class Level</p>
                <p className="font-medium text-gray-900">{user.classLevel}</p>
              </div>
            </div>
          )}
          {user.currentSchool && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <School className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Current School</p>
                <p className="font-medium text-gray-900">{user.currentSchool}</p>
              </div>
            </div>
          )}
          {user.targetInstitution && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Target Institution</p>
                <p className="font-medium text-gray-900">{user.targetInstitution}</p>
              </div>
            </div>
          )}
          {user.targetCourse && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <School className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Target Course</p>
                <p className="font-medium text-gray-900">{user.targetCourse}</p>
              </div>
            </div>
          )}
          {user.targetScore && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Target Score</p>
                <p className="font-medium text-gray-900">{user.targetScore}</p>
              </div>
            </div>
          )}
          {user.state && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">State</p>
                <p className="font-medium text-gray-900">{user.state}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

