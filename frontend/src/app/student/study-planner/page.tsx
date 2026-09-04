'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Calendar, CheckCircle, Circle, Clock, Plus, Bell, Trash2, BookOpen, Target } from 'lucide-react';

interface StudySchedule {
  id: string;
  title: string;
  description?: string;
  subject: string;
  topic?: string;
  dayOfWeek: string;
  time: string;
  durationMinutes: number;
  reminderEnabled: boolean;
  isCompleted: boolean;
  completedAt?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudyPlannerPage() {
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    dayOfWeek: 'Monday',
    time: '08:00',
    durationMinutes: 30,
    reminderEnabled: true,
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStudySchedules();
      setSchedules((data as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createStudySchedule(formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        subject: '',
        topic: '',
        dayOfWeek: 'Monday',
        time: '08:00',
        durationMinutes: 30,
        reminderEnabled: true,
      });
      fetchSchedules();
    } catch (err: any) {
      alert(err.message || 'Failed to create schedule');
    }
  }

  async function completeSchedule(id: string) {
    try {
      await api.completeStudySchedule(id);
      setSchedules(prev =>
        prev.map(s => s.id === id ? { ...s, isCompleted: true, completedAt: new Date().toISOString() } : s)
      );
    } catch (err: any) {
      alert(err.message || 'Failed to complete schedule');
    }
  }

  async function deleteSchedule(id: string) {
    try {
      await api.deleteStudySchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete schedule');
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
          <p className="text-gray-600 mt-1">Personalized study schedule</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchSchedules}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
          <p className="text-gray-600 mt-1">Manage your study schedule</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Study Schedule</h2>
          <form onSubmit={createSchedule} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Study Physics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Physics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Electricity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="480"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="reminder" className="text-sm text-gray-700">Enable reminder</label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Create Schedule
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No schedules yet</p>
            <p className="text-gray-400 text-sm mt-1">Create a study schedule to get started</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-xl border p-6 hover:shadow-md transition-shadow ${
                schedule.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => !schedule.isCompleted && completeSchedule(schedule.id)}
                    disabled={schedule.isCompleted}
                    className="mt-1"
                  >
                    {schedule.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 hover:text-primary-500" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-semibold ${schedule.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {schedule.title}
                    </h3>
                    {schedule.description && (
                      <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {schedule.subject}
                      </span>
                      {schedule.topic && (
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {schedule.topic}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {schedule.dayOfWeek}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {schedule.time}
                      </span>
                      <span>{schedule.durationMinutes} mins</span>
                      {schedule.reminderEnabled && !schedule.isCompleted && (
                        <span className="flex items-center gap-1 text-primary-600">
                          <Bell className="w-4 h-4" />
                          Reminder on
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
