'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Mail, Phone, GraduationCap, MapPin, Calendar, BookOpen, Award, FileText } from 'lucide-react';
import api from '@/lib/api';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  portalId: string;
  programme: string;
  classLevel: string;
  currentSchool?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  state?: string;
  lga?: string;
  examTypes?: string[];
  targetInstitution?: string;
  targetCourse?: string;
  studentEmail?: string;
  admissionYear?: string;
}

interface PerformanceData {
  totalExams: number;
  averageScore: number;
  totalHours: number;
  subjects?: Array<{ name: string; score: number }>;
}

interface CBTResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  duration?: number;
}

interface Assignment {
  id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  status?: string;
  description?: string;
}

interface AttendanceRecord {
  id: string;
  type: string;
  timestamp: string;
}

export default function ChildDetailsPage() {
  const params = useParams();
  const childId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [results, setResults] = useState<CBTResult[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  async function fetchChildData() {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, performanceRes, resultsRes, assignmentsRes, attendanceRes] = await Promise.allSettled([
        api.getProfile(),
        api.getPerformance(),
        api.getCBTResults(1),
        api.getAssignments(),
        api.getTimetable(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
      }
      if (performanceRes.status === 'fulfilled') {
        setPerformance(performanceRes.value.data);
      }
      if (resultsRes.status === 'fulfilled') {
        const data = resultsRes.value.data;
        setResults(Array.isArray(data) ? data : (data?.results || []));
      }
      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(assignmentsRes.value.data || []);
      }
      if (attendanceRes.status === 'fulfilled') {
        setAttendance(attendanceRes.value.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch child data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={fetchChildData} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No child data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Child Details</h1>
        <p className="text-gray-600 mt-1">Comprehensive view of your child&apos;s academic profile</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{profile.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{profile.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Portal ID</p>
              <p className="font-medium text-gray-900">{profile.portalId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Programme</p>
              <p className="font-medium text-gray-900">{profile.programme || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Class Level</p>
              <p className="font-medium text-gray-900">{profile.classLevel || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Current School</p>
              <p className="font-medium text-gray-900">{profile.currentSchool || 'N/A'}</p>
            </div>
          </div>
          {profile.targetInstitution && (
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Target Institution</p>
                <p className="font-medium text-gray-900">{profile.targetInstitution}</p>
                {profile.targetCourse && <p className="text-xs text-gray-500">{profile.targetCourse}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {performance && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Academic Performance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{performance.totalExams}</p>
              <p className="text-xs text-gray-500">Exams Taken</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{Math.round(performance.averageScore)}%</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{performance.totalHours}h</p>
              <p className="text-xs text-gray-500">Study Hours</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-xs text-gray-500">Results</p>
            </div>
          </div>
          {performance.subjects && performance.subjects.length > 0 && (
            <div className="space-y-2">
              {performance.subjects.map((subj, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{subj.name}</span>
                  <span className={`font-bold ${subj.score >= 70 ? 'text-green-600' : subj.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{subj.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Recent CBT Results
          </h2>
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No results yet</p>
          ) : (
            <div className="space-y-3">
              {results.slice(0, 10).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{result.subject}</p>
                    <p className="text-xs text-gray-500">{new Date(result.completedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-bold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            Assignments
          </h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 10).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-xs text-gray-500">{assignment.subject} {assignment.dueDate && `• Due ${new Date(assignment.dueDate).toLocaleDateString()}`}</p>
                  </div>
                  {assignment.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${assignment.status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {assignment.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
