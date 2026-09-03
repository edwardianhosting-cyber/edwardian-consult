'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, User, Phone, Camera, Upload, Calendar, MapPin, BookOpen, Target, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { authApi } from '@/lib/api';
import { JAMB_SUBJECTS, WAEC_NECO_SUBJECTS } from '@/lib/subjects';

const steps = [
  { id: 1, name: 'Personal', icon: User },
  { id: 2, name: 'Academic', icon: BookOpen },
  { id: 3, name: 'Exams', icon: GraduationCap },
  { id: 4, name: 'Subjects', icon: BookOpen },
  { id: 5, name: 'Target', icon: Target },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const classLevels = [
  { value: 'SS1', label: 'SS1' },
  { value: 'SS2', label: 'SS2' },
  { value: 'SS3', label: 'SS3' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'other', label: 'Other' },
];

const programmeOptions = [
  { value: 'JAMB', label: 'JAMB UTME' },
  { value: 'WAEC', label: 'WAEC' },
  { value: 'NECO', label: 'NECO' },
  { value: 'Post-UTME', label: 'Post-UTME' },
  { value: 'JUPEB', label: 'JUPEB' },
  { value: 'IJMB', label: 'IJMB' },
];

const jambSubjects = JAMB_SUBJECTS;

const waecNecoSubjects = WAEC_NECO_SUBJECTS;

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const institutions = [
  'University of Lagos',
  'University of Ibadan',
  'Obafemi Awolowo University',
  'University of Nigeria, Nsukka',
  'Ahmadu Bello University',
  'University of Benin',
  'University of Ilorin',
  'University of Jos',
  'University of Calabar',
  'University of Port Harcourt',
  'Nnamdi Azikiwe University',
  'Federal University of Technology, Minna',
  'Federal University of Technology, Akure',
  'Federal University of Technology, Owerri',
  'Ladoke Akintola University of Technology',
  'Olabisi Onabanjo University',
  'Lagos State University',
  'University of Uyo',
  'Abubakar Tafawa Balewa University',
  'Federal University, Lokoja',
  'Other',
];

const courses = [
  'Computer Science',
  'Medicine and Surgery',
  'Law',
  'Accounting',
  'Business Administration',
  'Economics',
  'Mass Communication',
  'Civil Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Architecture',
  'Pharmacy',
  'Nursing',
  'Microbiology',
  'Biochemistry',
  'Political Science',
  'Sociology',
  'Psychology',
  'English Literature',
  'History and International Studies',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Banking and Finance',
  'Marketing',
  'Public Administration',
  'Human Anatomy',
  'Physiotherapy',
  'Radiography',
  'Other',
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passportPreview, setPassportPreview] = useState('');

  const [formData, setFormData] = useState({
    // Personal
    fullName: '',
    email: '',
    phone: '',
    parentPhone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    state: '',
    lga: '',
    passport: null as File | null,

    // Academic
    currentSchool: '',
    classLevel: '',
    programme: '',

    // Exams — single exam only; can be changed later from the student's profile
    examTypes: [] as string[],

    // JAMB / Post-UTME (share the same 4-subject combo)
    jambSubjects: [] as string[],
    targetScore: '',

    // O'Level (WAEC/NECO) — subjects only; grades are added later in profile
    olevelSubjects: [] as string[],

    // Target
    targetInstitution: '',
    targetCourse: '',
    secondChoiceInstitution: '',
    secondChoiceCourse: '',
    admissionYear: '',
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ passport: file });
      const reader = new FileReader();
      reader.onloadend = () => setPassportPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Single-select: picking a new exam replaces the previous choice, and any
  // subjects already picked for the old exam type are cleared since JAMB/
  // Post-UTME and O'Level use different pickers.
  const selectExamType = (exam: string) => {
    updateFormData({ examTypes: [exam], jambSubjects: [], olevelSubjects: [] });
  };

  const toggleJambSubject = (subject: string) => {
    if (formData.jambSubjects.includes(subject)) {
      updateFormData({ jambSubjects: formData.jambSubjects.filter((s) => s !== subject) });
    } else if (formData.jambSubjects.length < 4) {
      updateFormData({ jambSubjects: [...formData.jambSubjects, subject] });
    }
  };

  const toggleOlevelSubject = (subject: string) => {
    if (formData.olevelSubjects.includes(subject)) {
      updateFormData({ olevelSubjects: formData.olevelSubjects.filter((s) => s !== subject) });
    } else if (formData.olevelSubjects.length < 9) {
      updateFormData({ olevelSubjects: [...formData.olevelSubjects, subject] });
    }
  };

  // The selected exam determines how many steps this student goes through:
  // Admission Target only applies to JAMB / Post-UTME candidates.
  const selectedExam = formData.examTypes[0] || '';
  const needsAdmissionTarget = selectedExam === 'JAMB' || selectedExam === 'Post-UTME';
  const totalSteps = needsAdmissionTarget ? 5 : 4;
  const visibleSteps = needsAdmissionTarget ? steps : steps.filter((s) => s.id !== 5);

  const nextStep = () => {
    setError('');
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.currentSchool || !formData.classLevel || !formData.programme) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (formData.examTypes.length === 0) {
          setError('Please select the examination you are preparing for');
          return false;
        }
        break;
      case 4:
        // JAMB and Post-UTME share the same subject combination.
        if (
          (selectedExam === 'JAMB' || selectedExam === 'Post-UTME') &&
          formData.jambSubjects.length !== 4
        ) {
          setError('Please select exactly 4 subjects for your JAMB/Post-UTME combination');
          return false;
        }
        // O'Level candidates pick their own subject list (up to 9).
        if (
          (selectedExam === 'WAEC' || selectedExam === 'NECO') &&
          formData.olevelSubjects.length === 0
        ) {
          setError('Please select at least one O\'Level subject');
          return false;
        }
        break;
      case 5:
        if (!formData.targetInstitution || !formData.targetCourse) {
          setError('Please fill in your target institution and course');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep(4) || (needsAdmissionTarget && !validateStep(5))) return;

    setLoading(true);

    try {
      // Strip the File object before sending — it isn't JSON-serializable and
      // this endpoint doesn't accept multipart uploads. Passport photo can be
      // uploaded separately from the student's profile after registration.
      const { passport, ...payload } = formData;

      const response = await authApi.register(payload);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/register/success');
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.message || 'Registration failed';

      // A network-level failure means the request never reached the server —
      // wrong/unreachable API URL, the server being down, or a CORS block.
      // Show the user something actionable instead of a raw fetch error.
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage =
          "Couldn't reach the server. Please check your internet connection and try again — if this keeps happening, the server may be temporarily down.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => updateFormData({ fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  placeholder="your@email.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                  placeholder="0800 000 0000"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => updateFormData({ parentPhone: e.target.value })}
                  placeholder="Parent's phone number"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateFormData({ gender: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  placeholder="Your residential address"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => updateFormData({ state: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select state</option>
                  {nigerianStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => updateFormData({ lga: e.target.value })}
                  placeholder="Local Government Area"
                  className="input-field"
                />
              </div>
            </div>

            {/* Passport Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photo</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-24 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                  {passportPreview ? (
                    <img src={passportPreview} alt="Passport" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handlePassportChange} className="hidden" />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">Upload a clear passport photograph</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Academic Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current School *</label>
                <input
                  type="text"
                  required
                  value={formData.currentSchool}
                  onChange={(e) => updateFormData({ currentSchool: e.target.value })}
                  placeholder="Name of your current school"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class/Level *</label>
                <select
                  required
                  value={formData.classLevel}
                  onChange={(e) => updateFormData({ classLevel: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select class</option>
                  {classLevels.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programme *</label>
                <select
                  required
                  value={formData.programme}
                  onChange={(e) => updateFormData({ programme: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select programme</option>
                  {programmeOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Examination Selection</h3>
            <p className="text-sm text-gray-600">
              Select the one examination you're preparing for right now. You can change this later from your
              profile.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Examination">
              {programmeOptions.map((exam) => (
                <button
                  key={exam.value}
                  type="button"
                  role="radio"
                  aria-checked={selectedExam === exam.value}
                  onClick={() => selectExamType(exam.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedExam === exam.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{exam.label}</div>
                </button>
              ))}
            </div>
            {selectedExam && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  Selected: {programmeOptions.find((p) => p.value === selectedExam)?.label}
                </p>
              </div>
            )}
          </div>
        );

      case 4: {
        const wantsJamb = selectedExam === 'JAMB';
        const wantsPostUtme = selectedExam === 'Post-UTME';
        const wantsOlevel = selectedExam === 'WAEC' || selectedExam === 'NECO';
        const showSubjectPicker = wantsJamb || wantsPostUtme;

        // Label adapts to the exam picked, since JAMB and Post-UTME use the
        // same 4-subject combination.
        const pickerLabel = wantsPostUtme ? 'Post-UTME Subjects' : 'JAMB Subjects';

        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Subject Selection</h3>

            {showSubjectPicker && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  {pickerLabel} <span className="text-sm text-gray-500">(Select exactly 4)</span>
                </h4>
                {wantsPostUtme && (
                  <p className="text-sm text-gray-500 mb-3">
                    Post-UTME screening uses the same subject combination you register for JAMB.
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {jambSubjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleJambSubject(subject)}
                      disabled={!formData.jambSubjects.includes(subject) && formData.jambSubjects.length >= 4}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        formData.jambSubjects.includes(subject)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 disabled:opacity-50'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {formData.jambSubjects.length}/4
                </p>
              </div>
            )}

            {wantsOlevel && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  O'Level Subjects <span className="text-sm text-gray-500">(Select up to 9)</span>
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  Pick the subjects you're sitting for {selectedExam}. You'll add your actual grades later from
                  your student profile once you have your results.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {waecNecoSubjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleOlevelSubject(subject)}
                      disabled={!formData.olevelSubjects.includes(subject) && formData.olevelSubjects.length >= 9}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        formData.olevelSubjects.includes(subject)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 disabled:opacity-50'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {formData.olevelSubjects.length}/9
                </p>
              </div>
            )}

            {!showSubjectPicker && !wantsOlevel && (
              <p className="text-sm text-gray-500">
                No subject selection is needed for the examination you chose. You can continue.
              </p>
            )}
          </div>
        );
      }

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Admission Target</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Institution *</label>
                <select
                  required
                  value={formData.targetInstitution}
                  onChange={(e) => updateFormData({ targetInstitution: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select institution</option>
                  {institutions.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Course *</label>
                <select
                  required
                  value={formData.targetCourse}
                  onChange={(e) => updateFormData({ targetCourse: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {needsAdmissionTarget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target JAMB/Post-UTME Score</label>
                  <input
                    type="number"
                    value={formData.targetScore}
                    onChange={(e) => updateFormData({ targetScore: e.target.value })}
                    placeholder="e.g., 300"
                    className="input-field"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Year</label>
                <select
                  value={formData.admissionYear}
                  onChange={(e) => updateFormData({ admissionYear: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select year</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Second Choice Institution</label>
                <select
                  value={formData.secondChoiceInstitution}
                  onChange={(e) => updateFormData({ secondChoiceInstitution: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select institution</option>
                  {institutions.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Second Choice Course</label>
                <select
                  value={formData.secondChoiceCourse}
                  onChange={(e) => updateFormData({ secondChoiceCourse: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500 rounded-2xl mb-4">
            <GraduationCap className="h-8 w-8 text-primary-900" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Become a Student</h1>
          <p className="mt-2 text-gray-600">Join Edwardian Educational Consult</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {visibleSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                {index < visibleSteps.length - 1 && (
                  <div
                    className={`w-12 h-1 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-accent-500 text-primary-900 font-bold rounded-xl hover:bg-accent-400 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'COMPLETE REGISTRATION'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}