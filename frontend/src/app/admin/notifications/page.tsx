'use client';

import { useState } from 'react';
import { Send, Users, Mail, MessageSquare, Bell, AlertTriangle, AlertCircle, Info, Calendar, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface NotificationForm {
  title: string;
  message: string;
  type: string;
  priority: string;
  targetType: string;
  targetFilter: {
    course?: string;
    institution?: string;
    userIds?: string[];
  };
  channels: string[];
  scheduledAt: string;
  link: string;
}

const defaultForm: NotificationForm = {
  title: '',
  message: '',
  type: 'ANNOUNCEMENT',
  priority: 'NORMAL',
  targetType: 'ALL',
  targetFilter: {},
  channels: ['DASHBOARD'],
  scheduledAt: '',
  link: '',
};

const notificationTypes = [
  { value: 'SYSTEM', label: 'System', icon: '🔔' },
  { value: 'CBT', label: 'CBT', icon: '📝' },
  { value: 'PAYMENT', label: 'Payment', icon: '💳' },
  { value: 'ADMISSION', label: 'Admission', icon: '🎓' },
  { value: 'ANNOUNCEMENT', label: 'Announcement', icon: '📢' },
  { value: 'ASSIGNMENT', label: 'Assignment', icon: '📚' },
  { value: 'RESULT', label: 'Result', icon: '📊' },
  { value: 'REMINDER', label: 'Reminder', icon: '⏰' },
  { value: 'MATERIAL', label: 'Material', icon: '📖' },
  { value: 'CERTIFICATE', label: 'Certificate', icon: '🏆' },
  { value: 'ID_CARD', label: 'ID Card', icon: '🪪' },
  { value: 'MESSAGE', label: 'Message', icon: '✉️' },
  { value: 'PROFILE', label: 'Profile', icon: '👤' },
];

const targetTypes = [
  { value: 'ALL', label: 'All Students' },
  { value: 'JAMB', label: 'JAMB Students' },
  { value: 'WAEC', label: 'WAEC Students' },
  { value: 'NECO', label: 'NECO Students' },
  { value: 'SS3', label: 'SS3 Students' },
  { value: 'COURSE', label: 'Specific Course' },
  { value: 'INSTITUTION', label: 'Target Institution' },
  { value: 'SELECTED', label: 'Selected Students' },
];

export default function AdminNotificationCenter() {
  const [form, setForm] = useState<NotificationForm>(defaultForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  function updateForm(key: keyof NotificationForm, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleChannel(channel: string) {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  }

  async function sendNotification(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.message) return;

    try {
      setSending(true);
      const data = await api.sendNotification(form);
      setRecipientCount(data.data.recipientCount);
      setSent(true);
      setForm(defaultForm);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
        <p className="text-gray-600 mt-1">Create and send notifications to students</p>
      </div>

      {sent && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Notification sent successfully to {recipientCount} recipients!
          </p>
        </div>
      )}

      <form onSubmit={sendNotification} className="space-y-6">
        {/* Notification Content */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Content</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g., New JAMB Mock Examination"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => updateForm('message', e.target.value)}
                placeholder="Enter notification message..."
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Link (optional)</label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => updateForm('link', e.target.value)}
                placeholder="e.g., /student/cbt/123"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Where should students go when they click this notification?</p>
            </div>
          </div>
        </div>

        {/* Type and Priority */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Type & Priority</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
              <select
                value={form.type}
                onChange={(e) => updateForm('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateForm('priority', 'NORMAL')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    form.priority === 'NORMAL'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => updateForm('priority', 'IMPORTANT')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    form.priority === 'IMPORTANT'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Important
                </button>
                <button
                  type="button"
                  onClick={() => updateForm('priority', 'URGENT')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    form.priority === 'URGENT'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Urgent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send To</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {targetTypes.map((target) => (
              <button
                key={target.value}
                type="button"
                onClick={() => updateForm('targetType', target.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  form.targetType === target.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {target.label}
              </button>
            ))}
          </div>

          {form.targetType === 'COURSE' && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter course name (e.g., Computer Science)"
                value={form.targetFilter.course || ''}
                onChange={(e) => updateForm('targetFilter', { ...form.targetFilter, course: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {form.targetType === 'INSTITUTION' && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter institution name (e.g., University of Lagos)"
                value={form.targetFilter.institution || ''}
                onChange={(e) => updateForm('targetFilter', { ...form.targetFilter, institution: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Channels</h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => toggleChannel('DASHBOARD')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                form.channels.includes('DASHBOARD')
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                form.channels.includes('DASHBOARD') ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Bell className={`w-5 h-5 ${form.channels.includes('DASHBOARD') ? 'text-primary-600' : 'text-gray-400'}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${form.channels.includes('DASHBOARD') ? 'text-primary-700' : 'text-gray-600'}`}>
                  Dashboard
                </p>
                <p className="text-xs text-gray-500">In-app notification</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleChannel('EMAIL')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                form.channels.includes('EMAIL')
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                form.channels.includes('EMAIL') ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Mail className={`w-5 h-5 ${form.channels.includes('EMAIL') ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${form.channels.includes('EMAIL') ? 'text-blue-700' : 'text-gray-600'}`}>
                  Email
                </p>
                <p className="text-xs text-gray-500">Send via email</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleChannel('SMS')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                form.channels.includes('SMS')
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                form.channels.includes('SMS') ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <MessageSquare className={`w-5 h-5 ${form.channels.includes('SMS') ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${form.channels.includes('SMS') ? 'text-green-700' : 'text-gray-600'}`}>
                  SMS
                </p>
                <p className="text-xs text-gray-500">Text message</p>
              </div>
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schedule"
                checked={!form.scheduledAt}
                onChange={() => updateForm('scheduledAt', '')}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-gray-700">Send Now</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schedule"
                checked={!!form.scheduledAt}
                onChange={() => updateForm('scheduledAt', new Date().toISOString())}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-gray-700">Schedule for Later</span>
            </label>
          </div>

          {form.scheduledAt && (
            <div className="mt-4">
              <input
                type="datetime-local"
                value={form.scheduledAt ? form.scheduledAt.slice(0, 16) : ''}
                onChange={(e) => updateForm('scheduledAt', e.target.value + ':00Z')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => setForm(defaultForm)}
            className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={sending || !form.title || !form.message}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}

