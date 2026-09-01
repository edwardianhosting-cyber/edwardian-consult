'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, MessageSquare, Save, Check } from 'lucide-react';
import { API_BASE } from '@/lib/api';

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
  sms: {
    importantAlerts: boolean;
    generalAnnouncements: boolean;
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
  sms: {
    importantAlerts: true,
    generalAnnouncements: false,
  },
};

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.notificationPreferences) {
          setPreferences({ ...defaultPreferences, ...user.notificationPreferences });
        }
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      await fetch(`${API_BASE}/notifications/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  }

  function updatePreference(
    category: keyof NotificationPreferences,
    key: string,
    value: boolean
  ) {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-1">Choose how you want to receive notifications</p>
        </div>
        <button
          onClick={savePreferences}
          disabled={saving}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } disabled:opacity-50`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </>
          )}
        </button>
      </div>

      {/* Dashboard Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Dashboard Notifications</h2>
            <p className="text-sm text-gray-500">Show notifications in the notification bell</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(preferences.dashboard).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updatePreference('dashboard', key, e.target.checked)}
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

      {/* Email Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(preferences.email).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updatePreference('email', key, e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-300'
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

      {/* SMS Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
            <p className="text-sm text-gray-500">Receive important alerts via SMS</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(preferences.sms).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updatePreference('sms', key, e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-green-600' : 'bg-gray-300'
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
        <p className="text-xs text-gray-500 mt-4">
          Note: SMS notifications may incur charges from your mobile carrier.
        </p>
      </div>
    </div>
  );
}

