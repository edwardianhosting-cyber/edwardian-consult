'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, X, Check } from 'lucide-react';
import { api } from '@/lib/api';

const COMMON_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature in English',
  'Christian Religious Studies',
  'Geography',
  'Accounting',
  'Commerce',
  'Agricultural Science',
  'Computer Studies',
  'Technical Drawing',
  'Food and Nutrition',
  'Home Management',
  'Music',
  'Fine Art',
  'History',
];

export default function CoursesPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customSubject, setCustomSubject] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMySubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function addSubject(subject: string) {
    if (!subject.trim() || subjects.includes(subject.trim())) return;
    const newSubjects = [...subjects, subject.trim()];
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateMySubjects(newSubjects);
      setSubjects(updated);
      setSuccess('Subject added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add subject');
    } finally {
      setSaving(false);
      setShowAddModal(false);
      setCustomSubject('');
    }
  }

  async function removeSubject(subject: string) {
    const newSubjects = subjects.filter(s => s !== subject);
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateMySubjects(newSubjects);
      setSubjects(updated);
      setSuccess('Subject removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove subject');
    } finally {
      setSaving(false);
    }
  }

  const availableSubjects = COMMON_SUBJECTS.filter(s => !Array.isArray(subjects) || !subjects.includes(s));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-600 mt-1">Manage the subjects you are registered for</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No subjects registered</p>
          <p className="text-gray-400 text-sm mt-1">Add subjects to start practicing CBT and accessing materials</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {subjects.map((subject) => (
              <div
                key={subject}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{subject}</h3>
                      <p className="text-xs text-gray-500">Registered</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSubject(subject)}
                    disabled={saving}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    title="Remove subject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={saving}
            className="px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary-400 hover:text-primary-600 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Add Another Subject
          </button>
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Subject</h2>
              <button
                onClick={() => { setShowAddModal(false); setCustomSubject(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {availableSubjects.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Select from common subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => addSubject(subject)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition-colors disabled:opacity-50"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                      addSubject(customSubject);
                    }
                  }}
                  placeholder="e.g., Further Mathematics"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => addSubject(customSubject)}
                  disabled={saving || !customSubject.trim()}
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
