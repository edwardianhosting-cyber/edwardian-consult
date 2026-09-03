'use client';

import { useEffect, useState, useMemo } from 'react';
import { User, Mail, Phone, MapPin, School, Calendar, Camera, Save, Check, Loader2, Edit2, X, BookOpen, Target, GraduationCap, Lock, Award, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { ALL_SUBJECTS, JAMB_SUBJECTS, WAEC_NECO_SUBJECTS } from '@/lib/subjects';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const CLASS_LEVELS = ['SS1', 'SS2', 'SS3', 'Graduate', 'Other'];

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
  const types = (examTypes || []).map((t) => t.toUpperCase());
  const prog = (programme || '').toUpperCase();
  if (types.includes('JAMB') || types.includes('POST_UTME') || prog === 'JAMB' || prog === 'POST-UTME' || prog === 'POST_UTME') {
    return 4;
  }
  if (types.includes('WAEC') || types.includes('NECO') || prog === 'WAEC' || prog === 'NECO') {
    return 9;
  }
  return 9;
}

interface ProfileForm {
  // Read-only — shown but not editable
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  portalId: string;
  role: string;
  studentEmail?: string;
  avatar?: string;

  // Personal
  address: string;
  state: string;
  lga: string;

  // Academic
  currentSchool: string;
  classLevel: string;
  programme: string;

  // Exams
  examTypes: string[];
  jambSubjects: string[];
  olevelResults: string[];
  targetScore: string;

  // Target
  targetInstitution: string;
  targetCourse: string;
  secondChoiceInstitution: string;
  secondChoiceCourse: string;
  admissionYear: string;
}

const EMPTY_FORM: ProfileForm = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  portalId: '',
  role: 'STUDENT',
  address: '',
  state: '',
  lga: '',
  currentSchool: '',
  classLevel: '',
  programme: '',
  examTypes: [],
  jambSubjects: [],
  olevelResults: [],
  targetScore: '',
  targetInstitution: '',
  targetCourse: '',
  secondChoiceInstitution: '',
  secondChoiceCourse: '',
  admissionYear: '',
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await api.getProfile();
      const data = (res as any).data || res;
      setForm({
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

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue(field: 'examTypes' | 'jambSubjects' | 'olevelResults', value: string) {
    setForm((prev) => {
      const list = prev[field] || [];
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }

  const maxJamb = useMemo(
    () => getMaxForProgramme(form.programme, form.examTypes),
    [form.programme, form.examTypes]
  );
  const maxOlevel = 9;

  async function saveProfile() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.updateProfile({
        address: form.address || null,
        state: form.state || null,
        lga: form.lga || null,
        currentSchool: form.currentSchool || null,
        classLevel: form.classLevel || null,
        programme: form.programme || null,
        examTypes: form.examTypes,
        jambSubjects: form.jambSubjects,
        olevelResults: form.olevelResults,
        targetScore: form.targetScore || null,
        targetInstitution: form.targetInstitution || null,
        targetCourse: form.targetCourse || null,
        secondChoiceInstitution: form.secondChoiceInstitution || null,
        secondChoiceCourse: form.secondChoiceCourse || null,
        admissionYear: form.admissionYear || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Update the information you provided during registration.
          </p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className={`px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } disabled:opacity-50`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Profile Header (read-only) */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              {form.avatar ? (
                <img src={form.avatar} alt={form.fullName} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {form.fullName?.charAt(0) || 'S'}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{form.fullName}</h2>
            <p className="text-gray-500">{form.portalId}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                {form.programme || 'No programme selected'}
              </span>
              {form.studentEmail && (
                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {form.studentEmail}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Read-only fields (locked) */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          Personal Details
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          These details are locked. To change them, please contact the registrar.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <LockedField label="Full Name" value={form.fullName} icon={User} />
          <LockedField label="Email" value={form.email} icon={Mail} />
          <LockedField label="Phone Number" value={form.phone} icon={Phone} />
          <LockedField
            label="Date of Birth"
            value={form.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString() : ''}
            icon={Calendar}
          />
          <LockedField label="Gender" value={form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : ''} icon={User} />
        </div>
      </div>

      {/* Contact & Location */}
      <Section title="Contact & Location" icon={MapPin}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Address">
              <textarea
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </Field>
          </div>
          <Field label="State">
            <select
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select state…</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="LGA">
            <input
              type="text"
              value={form.lga}
              onChange={(e) => update('lga', e.target.value)}
              placeholder="Local Government Area"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </Field>
        </div>
      </Section>

      {/* Academic */}
      <Section title="Academic Information" icon={School}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Current School">
            <input
              type="text"
              value={form.currentSchool}
              onChange={(e) => update('currentSchool', e.target.value)}
              placeholder="e.g., Kings College Lagos"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </Field>
          <Field label="Class Level">
            <select
              value={form.classLevel}
              onChange={(e) => update('classLevel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select class…</option>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Primary Programme">
            <select
              value={form.programme}
              onChange={(e) => update('programme', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select programme…</option>
              {PROGRAMME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.help}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Examination Type & Subjects */}
      <Section title="Examination Type & Subjects" icon={GraduationCap}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Types (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPE_OPTIONS.map((opt) => {
                const active = form.examTypes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleArrayValue('examTypes', opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                JAMB / Post-UTME Subjects
              </label>
              <span
                className={`text-xs font-medium ${
                  form.jambSubjects.length > maxJamb ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {form.jambSubjects.length} / {maxJamb}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              JAMB requires exactly 4 subjects. You can also manage these from{' '}
              <a href="/student/courses" className="text-primary-600 hover:underline">
                My Subjects
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg">
              {JAMB_SUBJECTS.map((s) => {
                const active = form.jambSubjects.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleArrayValue('jambSubjects', s)}
                    className={`px-2 py-1 rounded text-xs border transition-colors ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {form.jambSubjects.length > maxJamb && (
              <p className="mt-1 text-xs text-red-600">
                Too many subjects. JAMB allows {maxJamb}. Remove {form.jambSubjects.length - maxJamb}.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                O'Level (WAEC / NECO) Subjects
              </label>
              <span
                className={`text-xs font-medium ${
                  form.olevelResults.length > maxOlevel ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {form.olevelResults.length} / {maxOlevel}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              O'Level candidates may register up to 9 subjects. You can add grades later.
            </p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg">
              {WAEC_NECO_SUBJECTS.map((s) => {
                const active = form.olevelResults.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleArrayValue('olevelResults', s)}
                    className={`px-2 py-1 rounded text-xs border transition-colors ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {form.olevelResults.length > maxOlevel && (
              <p className="mt-1 text-xs text-red-600">
                Too many subjects. O'Level allows {maxOlevel}. Remove {form.olevelResults.length - maxOlevel}.
              </p>
            )}
          </div>

          <div>
            <Field label="Target Score">
              <input
                type="text"
                value={form.targetScore}
                onChange={(e) => update('targetScore', e.target.value)}
                placeholder="e.g., 280"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Target */}
      <Section title="Target Institution & Course" icon={Target}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First Choice Institution">
            <input
              type="text"
              value={form.targetInstitution}
              onChange={(e) => update('targetInstitution', e.target.value)}
              placeholder="e.g., University of Lagos"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </Field>
          <Field label="First Choice Course">
            <input
              type="text"
              value={form.targetCourse}
              onChange={(e) => update('targetCourse', e.target.value)}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </Field>
          <Field label="Second Choice Institution">
            <input
              type="text"
              value={form.secondChoiceInstitution}
              onChange={(e) => update('secondChoiceInstitution', e.target.value)}
              placeholder="e.g., University of Ibadan"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </Field>
          <Field label="Second Choice Course">
            <input
              type="text"
              value={form.secondChoiceCourse}
              onChange={(e) => update('secondChoiceCourse', e.target.value)}
              placeholder="e.g., Mathematics"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </Field>
          <Field label="Admission Year">
            <input
              type="text"
              value={form.admissionYear}
              onChange={(e) => update('admissionYear', e.target.value)}
              placeholder="e.g., 2027"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </Field>
        </div>
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-20">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {saved
              ? '✓ Profile saved'
              : 'Changes are saved when you click "Save Changes" above.'}
          </p>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary-600" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function LockedField({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-gray-400" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          {label}
          <Lock className="w-3 h-3" />
        </p>
        <p className="font-medium text-gray-700 truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
