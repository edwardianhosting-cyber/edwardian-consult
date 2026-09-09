'use client';

import { useEffect, useState } from 'react';
import api, { studyApi } from '@/lib/api';
import { Calendar, Plus, Trash2, Save, Edit } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  instructor?: string;
  venue?: string;
  type?: string;
  examType?: string;
}

interface StudySubject {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  fullName: string;
}

interface Institution {
  id: string;
  name: string;
}

export default function AdminTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '09:00',
    subject: '',
    instructor: '',
    venue: '',
    type: 'CLASS',
    examType: '',
  });

  useEffect(() => {
    fetchEntries();
    fetchSubjects();
    fetchTeachers();
    fetchInstitutions();
  }, []);

  async function fetchEntries() {
    try {
      setLoading(true);
      const data = await api.getAllTimetableEntries();
      setEntries((data as any).data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubjects() {
    try {
      const data = await studyApi.getSubjects();
      setSubjects(data.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  }

  async function fetchTeachers() {
    try {
      const data = await api.getUsers({ role: 'TEACHER' });
      const users = (data as any).data || [];
      const teacherList = users
        .filter((user: any) => user.role === 'TEACHER')
        .map((user: any) => ({ id: user.id, fullName: user.fullName }));
      setTeachers(teacherList);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  }

  async function fetchInstitutions() {
    try {
      const data = await api.getInstitutions();
      const institutionsData = (data as any).data || [];
      setInstitutions(institutionsData);
    } catch (err) {
      console.error('Failed to fetch institutions:', err);
    }
  }

  function openCreateForm() {
    setEditingEntry(null);
    setFormData({
      day: 'Monday',
      time: '09:00',
      subject: '',
      instructor: '',
      venue: '',
      type: 'CLASS',
      examType: '',
    });
    setShowForm(true);
  }

  function openEditForm(entry: TimetableEntry) {
    setEditingEntry(entry);
    setFormData({
      day: entry.day,
      time: entry.time,
      subject: entry.subject,
      instructor: entry.instructor || '',
      venue: entry.venue || '',
      type: entry.type || 'CLASS',
      examType: entry.examType || '',
    });
    setShowForm(true);
  }

  async function createEntry(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createTimetableEntry(formData);
      setShowForm(false);
      setFormData({
        day: 'Monday',
        time: '09:00',
        subject: '',
        instructor: '',
        venue: '',
        type: 'CLASS',
        examType: '',
      });
      fetchEntries();
    } catch (err: any) {
      alert(err.message || 'Failed to create entry');
    }
  }

  async function updateEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEntry) return;
    try {
      await api.updateTimetableEntry(editingEntry.id, formData);
      setShowForm(false);
      setEditingEntry(null);
      setFormData({
        day: 'Monday',
        time: '09:00',
        subject: '',
        instructor: '',
        venue: '',
        type: 'CLASS',
        examType: '',
      });
      fetchEntries();
    } catch (err: any) {
      alert(err.message || 'Failed to update entry');
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this timetable entry?')) return;
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-1">Create and manage class timetable</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingEntry ? 'Edit Timetable Entry' : 'New Timetable Entry'}
          </h2>
          <form onSubmit={editingEntry ? updateEntry : createEntry} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select subject...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <select
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Universities</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <select
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select instructor...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.fullName}>{teacher.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option>CLASS</option>
                <option>EXAM</option>
                <option>REVISION</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option>JAMB</option>
                <option>WAEC</option>
                <option>NECO</option>
                <option>POST-UTME</option>
              </select>
            </div>
            <div className="lg:col-span-4 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Entry
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Day</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subject</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Instructor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Venue</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Exam Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No timetable entries yet
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{entry.day}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{entry.time}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{entry.subject}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{entry.instructor || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{entry.venue || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{entry.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{entry.examType || 'All'}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(entry)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
