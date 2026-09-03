'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, X, Check, AlertCircle, Info, Settings } from 'lucide-react';
import api from '@/lib/api';
import { ALL_SUBJECTS } from '@/lib/subjects';

const COMMON_SUBJECTS = ALL_SUBJECTS;

const PROGRAMME_OPTIONS = [
  { value: 'JAMB', label: 'JAMB UTME', max: 4, help: 'Pick exactly 4 subjects' },
  { value: 'Post-UTME', label: 'Post-UTME', max: 4, help: 'Uses the same 4 JAMB subjects' },
  { value: 'WAEC', label: "O'Level (WAEC)", max: 9, help: 'Up to 9 subjects' },
  { value: 'NECO', label: "O'Level (NECO)", max: 9, help: 'Up to 9 subjects' },
  { value: 'JUPEB', label: 'JUPEB', max: 9, help: 'Up to 9 subjects' },
  { value: 'IJMB', label: 'IJMB', max: 9, help: 'Up to 9 subjects' },
];

const EXAM_TYPE_OPTIONS = [
  { value: 'JAMB', label: 'JAMB' },
  { value: 'POST_UTME', label: 'Post-UTME' },
  { value: 'WAEC', label: 'WAEC' },
  { value: 'NECO', label: 'NECO' },
  { value: 'JUPEB', label: 'JUPEB' },
  { value: 'IJMB', label: 'IJMB' },
];

function getMaxForProgramme(programme: string | null | undefined, examTypes: string[] = []): number {
  const types = examTypes.map((t) => t.toUpperCase());
  const prog = (programme || '').toUpperCase();
  if (
    types.includes('JAMB') ||
    types.includes('POST_UTME') ||
    prog === 'JAMB' ||
    prog === 'POST-UTME' ||
    prog === 'POST_UTME'
  ) {
    return 4;
  }
  if (types.includes('WAEC') || types.includes('NECO') || prog === 'WAEC' || prog === 'NECO') {
    return 9;
  }
  return 9; // default to O'Level limit
}

function programmeLabelFor(programme: string | null | undefined, examTypes: string[] = []): string {
  const max = getMaxForProgramme(programme, examTypes);
  if (max === 4) return 'JAMB / Post-UTME (max 4 subjects)';
  return "O'Level — WAEC / NECO / JUPEB / IJMB (max 9 subjects)";
}

export default function CoursesPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [programme, setProgramme] = useState<string>('');
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customSubject, setCustomSubject] = useState('');

  const maxSubjects = useMemo(
    () => getMaxForProgramme(programme, examTypes),
    [programme, examTypes]
  );
  const programmeLabel = useMemo(
    () => programmeLabelFor(programme, examTypes),
    [programme, examTypes]
  );
  const isJambLike = maxSubjects === 4;

  useEffect(() => {
    fetchProfile();
    fetchSubjects();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.getProfile();
      const data = (res as any).data || res;
      setProgramme(data?.programme || '');
      setExamTypes((data?.examTypes as string[]) || []);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }

  async function fetchSubjects() {
    try {
      setSubjectsLoading(true);
      setError(null);
      const res = await api.getMySubjects();
      const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
      setSubjects(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  }

  async function saveProgrammeAndExamTypes(nextProgramme: string, nextExamTypes: string[]) {
    setSavingProfile(true);
    setError(null);
    setSuccess(null);
    try {
      await api.updateProfile({
        programme: nextProgramme || null,
        examTypes: nextExamTypes,
      });
      setProgramme(nextProgramme);
      setExamTypes(nextExamTypes);
      setSuccess('Profile updated. Subject limits have been updated to match.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  function toggleExamType(value: string) {
    const next = examTypes.includes(value)
      ? examTypes.filter((t) => t !== value)
      : [...examTypes, value];
    setExamTypes(next);
  }

  async function addSubject(subject: string) {
    const name = subject.trim();
    if (!name || subjects.includes(name)) return;
    if (subjects.length >= maxSubjects) {
      setError(
        isJambLike
          ? `You have reached the maximum of ${maxSubjects} subjects for JAMB / Post-UTME. JAMB only allows 4 subject combinations (English + 3 others). Please remove a subject before adding a new one.`
          : `You have reached the maximum of ${maxSubjects} subjects for O'Level (WAEC / NECO). Please remove a subject before adding a new one.`
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api.updateMySubjects([...subjects, name]);
      const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [...subjects, name];
      setSubjects(list);
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
    const newSubjects = subjects.filter((s) => s !== subject);
    setSaving(true);
    setError(null);
    try {
      const res = await api.updateMySubjects(newSubjects);
      const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : newSubjects;
      setSubjects(list);
      setSuccess('Subject removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove subject');
    } finally {
      setSaving(false);
    }
  }

  const availableSubjects = COMMON_SUBJECTS.filter(
    (s) => !Array.isArray(subjects) || !subjects.includes(s)
  );
  const atLimit = subjects.length >= maxSubjects;

  if (subjectsLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-600 mt-1">Manage the subjects you are registered for</p>
      </div>

      {/* Programme / Exam type selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" />
              Examination Type
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              The exam type you select determines how many subjects you can register ({maxSubjects}{' '}
              max). Change this any time — your subject list will be kept.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Programme</label>
            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              disabled={savingProfile}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="">Select a programme…</option>
              {PROGRAMME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.help}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">All Exam Types</label>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPE_OPTIONS.map((opt) => {
                const active = examTypes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleExamType(opt.value)}
                    disabled={savingProfile}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Current: <span className="font-medium text-gray-700">{programmeLabel}</span>
          </p>
          <button
            onClick={() => saveProgrammeAndExamTypes(programme, examTypes)}
            disabled={savingProfile}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
          >
            {savingProfile ? 'Saving…' : 'Save Examination Type'}
          </button>
        </div>
      </div>

      {/* Subject-limit info banner */}
      <div
        className={`rounded-xl p-4 flex items-start gap-3 border ${
          atLimit
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}
      >
        {atLimit ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        )}
        <div className="text-sm">
          <p className="font-medium">
            {atLimit
              ? `You have reached the maximum of ${maxSubjects} subject${
                  maxSubjects === 1 ? '' : 's'
                } for ${
                  isJambLike ? 'JAMB / Post-UTME' : "O'Level (WAEC / NECO)"
                }.`
              : `You can register up to ${maxSubjects} subject${
                  maxSubjects === 1 ? '' : 's'
                } for ${
                  isJambLike ? 'JAMB / Post-UTME' : "O'Level (WAEC / NECO)"
                }.`}
          </p>
          <p className="mt-1 text-xs">
            {isJambLike
              ? 'JAMB UTME requires exactly 4 subjects (English Language is compulsory, plus 3 others). Post-UTME screening uses the same combination.'
              : "O'Level (WAEC / NECO) candidates may register up to 9 subjects."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2 text-sm">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Subject count / progress */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{subjects.length}</span> / {maxSubjects}{' '}
          subject{subjects.length === 1 ? '' : 's'} registered
        </p>
        {subjects.length > maxSubjects && (
          <p className="text-sm text-red-600 font-medium">
            You have more subjects than allowed. Please remove {subjects.length - maxSubjects}.
          </p>
        )}
      </div>

      {/* Subject list */}
      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No subjects registered</p>
          <p className="text-gray-400 text-sm mt-1">
            Add up to {maxSubjects} subject{maxSubjects === 1 ? '' : 's'} to start practicing CBT and
            accessing materials.
          </p>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Subject</h2>
                <p className="text-sm text-gray-500">
                  {atLimit
                    ? `Maximum reached (${maxSubjects} for ${
                        isJambLike ? 'JAMB / Post-UTME' : "O'Level"
                      }). Remove a subject first.`
                    : `You can add ${maxSubjects - subjects.length} more subject${
                        maxSubjects - subjects.length === 1 ? '' : 's'
                      } (${maxSubjects} max for ${
                        isJambLike ? 'JAMB / Post-UTME' : "O'Level"
                      }).`}
                </p>
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

            {atLimit && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {isJambLike
                    ? `JAMB / Post-UTME candidates can only register 4 subjects. English Language is compulsory, plus 3 others. Remove one of your current subjects before adding another.`
                    : `O'Level (WAEC / NECO) candidates can register up to 9 subjects. Remove one of your current subjects before adding another.`}
                </span>
              </div>
            )}

            {availableSubjects.length > 0 && !atLimit && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Select from common subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => addSubject(subject)}
                      disabled={saving || atLimit}
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
                      if (!atLimit) addSubject(customSubject);
                    }
                  }}
                  placeholder="e.g., Further Mathematics"
                  disabled={atLimit}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                <button
                  onClick={() => addSubject(customSubject)}
                  disabled={saving || !customSubject.trim() || atLimit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {atLimit && (
                <p className="mt-2 text-xs text-amber-700">
                  Subject input is disabled because you have reached the {maxSubjects}-subject
                  limit.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
