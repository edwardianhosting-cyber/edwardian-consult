'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Bell, Shield, Eye, EyeOff, Save, Check, Loader2, ChevronRight, Settings, BookOpen, Plus, X, AlertCircle, Info, MapPin, School, Target, GraduationCap } from 'lucide-react';
import api from '@/lib/api';
import { ALL_SUBJECTS } from '@/lib/subjects';

interface NotificationPreferences {
  dashboard: {
    academic: boolean;
    examination: boolean;
    admission: boolean;
    payment: boolean;
    announcements: boolean;
    studyMaterials: boolean;
  };
  email: {
    academic: boolean;
    examination: boolean;
    admission: boolean;
    payment: boolean;
    promotional: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  dashboard: {
    academic: true,
    examination: true,
    admission: true,
    payment: true,
    announcements: true,
    studyMaterials: true,
  },
  email: {
    academic: true,
    examination: true,
    admission: true,
    payment: true,
    promotional: false,
  },
};

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const CLASS_LEVELS = ['SS1', 'SS2', 'SS3', 'Graduate', 'Other'];

const PROGRAMME_OPTIONS = [
  { value: 'JAMB', label: 'JAMB UTME' },
  { value: 'POST_UTME', label: 'Post-UTME' },
  { value: 'WAEC', label: "O'Level (WAEC)" },
  { value: 'NECO', label: "O'Level (NECO)" },
  { value: 'JUPEB', label: 'JUPEB' },
  { value: 'IJMB', label: 'IJMB' },
];

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  lga: string;
  currentSchool: string;
  classLevel: string;
  programme: string;
  targetScore: string;
  targetInstitution: string;
  targetCourse: string;
  secondChoiceInstitution: string;
  secondChoiceCourse: string;
  admissionYear: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<ProfileForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    lga: '',
    currentSchool: '',
    classLevel: '',
    programme: '',
    targetScore: '',
    targetInstitution: '',
    targetCourse: '',
    secondChoiceInstitution: '',
    secondChoiceCourse: '',
    admissionYear: '',
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultPreferences);

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const [examSuccess, setExamSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customSubject, setCustomSubject] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchNotificationPreferences();
    fetchExamSettings();
  }, []);

  async function fetchExamSettings() {
    try {
      const data = await api.getProfile();
      const user = (data as any).data || data;
      setExamTypes((user?.examTypes as string[]) || []);
      const subjectsRes = await api.getMySubjects();
      const list = Array.isArray(subjectsRes) ? subjectsRes : Array.isArray((subjectsRes as any)?.data) ? (subjectsRes as any).data : [];
      setSubjects(list);
    } catch (error) {
      console.error('Failed to fetch exam settings:', error);
    } finally {
      setSubjectsLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const data = await api.getProfile();
      const user = data.data;
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        state: user.state || '',
        lga: user.lga || '',
        currentSchool: user.currentSchool || '',
        classLevel: user.classLevel || '',
        programme: user.programme || '',
        targetScore: user.targetScore || '',
        targetInstitution: user.targetInstitution || '',
        targetCourse: user.targetCourse || '',
        secondChoiceInstitution: user.secondChoiceInstitution || '',
        secondChoiceCourse: user.secondChoiceCourse || '',
        admissionYear: user.admissionYear || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }

  async function fetchNotificationPreferences() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.notificationPreferences) {
          setNotifications({ ...defaultPreferences, ...user.notificationPreferences } as NotificationPreferences);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    }
  }

  async function saveProfile() {
    setLoading(true);
    try {
      await api.updateProfile({
        fullName: profile.fullName || undefined,
        phone: profile.phone || undefined,
        address: profile.address || null,
        state: profile.state || null,
        lga: profile.lga || null,
        currentSchool: profile.currentSchool || null,
        classLevel: profile.classLevel || null,
        programme: profile.programme || null,
        targetScore: profile.targetScore || null,
        targetInstitution: profile.targetInstitution || null,
        targetCourse: profile.targetCourse || null,
        secondChoiceInstitution: profile.secondChoiceInstitution || null,
        secondChoiceCourse: profile.secondChoiceCourse || null,
        admissionYear: profile.admissionYear || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateNotificationPreference(category: keyof NotificationPreferences, key: string, value: boolean) {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));

    try {
      const updatedPreferences = {
        ...notifications,
        [category]: {
          ...notifications[category],
          [key]: value,
        },
      };
      await api.updateNotificationPreferences(updatedPreferences);
    } catch (error) {
      console.error('Failed to update notification preference:', error);
    }
  }

  async function changePassword() {
    if (password.new !== password.confirm) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.changePassword({ currentPassword: password.current, newPassword: password.new });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      alert(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'examination', label: 'Examination', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Contact & Location
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your address"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                  <input
                    type="text"
                    value={profile.lga}
                    onChange={(e) => setProfile({ ...profile, lga: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Local Government Area"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-primary-600" />
              Academic Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current School</label>
                <input
                  type="text"
                  value={profile.currentSchool}
                  onChange={(e) => setProfile({ ...profile, currentSchool: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Kings College Lagos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                <select
                  value={profile.classLevel}
                  onChange={(e) => setProfile({ ...profile, classLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select class…</option>
                  {CLASS_LEVELS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Programme</label>
                <select
                  value={profile.programme}
                  onChange={(e) => setProfile({ ...profile, programme: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select programme…</option>
                  {PROGRAMME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Target Institution & Course
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Choice Institution</label>
                <input
                  type="text"
                  value={profile.targetInstitution}
                  onChange={(e) => setProfile({ ...profile, targetInstitution: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., University of Lagos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Choice Course</label>
                <input
                  type="text"
                  value={profile.targetCourse}
                  onChange={(e) => setProfile({ ...profile, targetCourse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Choice Institution</label>
                <input
                  type="text"
                  value={profile.secondChoiceInstitution}
                  onChange={(e) => setProfile({ ...profile, secondChoiceInstitution: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., University of Ibadan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Choice Course</label>
                <input
                  type="text"
                  value={profile.secondChoiceCourse}
                  onChange={(e) => setProfile({ ...profile, secondChoiceCourse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Year</label>
                <input
                  type="text"
                  value={profile.admissionYear}
                  onChange={(e) => setProfile({ ...profile, admissionYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2027"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Score</label>
                <input
                  type="text"
                  value={profile.targetScore}
                  onChange={(e) => setProfile({ ...profile, targetScore: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 280"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveProfile}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Examination Tab */}
      {activeTab === 'examination' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Examination Type</h3>
                <p className="text-sm text-gray-500">Choose your programme and exam types. This controls your subject limit and notifications.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Programme</label>
                <select
                  value={profile.programme}
                  onChange={(e) => setProfile({ ...profile, programme: e.target.value })}
                  disabled={savingExam}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <option value="">Select a programme…</option>
                  {PROGRAMME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Types</label>
                <div className="flex flex-wrap gap-2">
                  {['JAMB', 'POST_UTME', 'WAEC', 'NECO', 'JUPEB', 'IJMB'].map((type) => {
                    const active = examTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setExamTypes((prev) =>
                            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                          )
                        }
                        disabled={savingExam}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                          active
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Programme: <span className="font-medium text-gray-700">{profile.programme || 'Not set'}</span>
              </p>
              <button
                onClick={async () => {
                  setSavingExam(true);
                  setExamError(null);
                  setExamSuccess(null);
                  try {
                    await api.updateProfile({ programme: profile.programme || null, examTypes });
                    setExamSuccess('Examination settings updated');
                    setTimeout(() => setExamSuccess(null), 4000);
                  } catch (err: any) {
                    setExamError(err.message || 'Failed to update examination settings');
                  } finally {
                    setSavingExam(false);
                  }
                }}
                disabled={savingExam}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
              >
                {savingExam ? 'Saving…' : 'Save Examination Settings'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Subjects</h3>
                <p className="text-sm text-gray-500">Add or remove subjects for your current programme.</p>
              </div>
            </div>
            {examError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                {examError}
              </div>
            )}
            {examSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {examSuccess}
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {subjects.map((subject) => (
                <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{subject}</span>
                  <button
                    onClick={async () => {
                      setSavingSubjects(true);
                      setExamError(null);
                      try {
                        const next = subjects.filter((s) => s !== subject);
                        const res = await api.updateMySubjects(next);
                        const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : next;
                        setSubjects(list);
                      } catch (err: any) {
                        setExamError(err.message || 'Failed to remove subject');
                      } finally {
                        setSavingSubjects(false);
                      }
                    }}
                    disabled={savingSubjects}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={savingSubjects}
              className="px-4 py-2 border border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-primary-400 hover:text-primary-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500">Toggle notifications on or off. Changes are saved automatically.</p>
            </div>
            <Link
              href="/student/settings/notifications"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Advanced Settings <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Dashboard Notifications
              </h4>
              <div className="space-y-3">
                {Object.entries(notifications.dashboard).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-gray-700 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateNotificationPreference('dashboard', key, e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}
                        />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Email Notifications
              </h4>
              <div className="space-y-3">
                {Object.entries(notifications.email).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-gray-700 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateNotificationPreference('email', key, e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}
                        />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={changePassword}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Password Changed!' : 'Change Password'}
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Subject</h2>
                <p className="text-sm text-gray-500">Add a subject to your registered list.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setCustomSubject('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select from common subjects:</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SUBJECTS.filter((s) => !subjects.includes(s)).map((subject) => (
                  <button
                    key={subject}
                    onClick={async () => {
                      setSavingSubjects(true);
                      setExamError(null);
                      try {
                        const res = await api.updateMySubjects([...subjects, subject]);
                        const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [...subjects, subject];
                        setSubjects(list);
                        setShowAddModal(false);
                        setCustomSubject('');
                      } catch (err: any) {
                        setExamError(err.message || 'Failed to add subject');
                      } finally {
                        setSavingSubjects(false);
                      }
                    }}
                    disabled={savingSubjects}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition-colors disabled:opacity-50"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Or enter a custom subject:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customSubject.trim() && !subjects.includes(customSubject.trim())) {
                        setSavingSubjects(true);
                        setExamError(null);
                        api.updateMySubjects([...subjects, customSubject.trim()])
                          .then((res) => {
                            const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [...subjects, customSubject.trim()];
                            setSubjects(list);
                            setShowAddModal(false);
                            setCustomSubject('');
                          })
                          .catch((err: any) => setExamError(err.message || 'Failed to add subject'))
                          .finally(() => setSavingSubjects(false));
                      }
                    }
                  }}
                  placeholder="e.g., Further Mathematics"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={async () => {
                    if (!customSubject.trim() || subjects.includes(customSubject.trim())) return;
                    setSavingSubjects(true);
                    setExamError(null);
                    try {
                      const res = await api.updateMySubjects([...subjects, customSubject.trim()]);
                      const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [...subjects, customSubject.trim()];
                      setSubjects(list);
                      setShowAddModal(false);
                      setCustomSubject('');
                    } catch (err: any) {
                      setExamError(err.message || 'Failed to add subject');
                    } finally {
                      setSavingSubjects(false);
                    }
                  }}
                  disabled={savingSubjects || !customSubject.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
