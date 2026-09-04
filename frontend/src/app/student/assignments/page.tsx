'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ClipboardList, Calendar, Upload, CheckCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  submittedAt?: string;
  fileUrl?: string;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!submitting) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitting]);

  useEffect(() => {
    if (!submitting) return;

    const dispose = router.beforePopState(() => {
      setPendingNavigation(() => () => router.back());
      setShowLeaveWarning(true);
      return false;
    });

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement | null;
      if (link && link.href && !link.href.includes('#') && !link.href.includes(window.location.origin + window.location.pathname)) {
        e.preventDefault();
        const href = link.getAttribute('href');
        setPendingNavigation(() => () => {
          if (href) router.push(href);
        });
        setShowLeaveWarning(true);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      dispose();
    };
  }, [submitting, router]);

  async function fetchAssignments() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAvailableAssignments();
      setAssignments(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }

  async function submitAssignment(assignmentId: string) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt';

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setSubmitting(assignmentId);
        const reader = new FileReader();
        reader.onload = async () => {
          await api.submitAssignment(assignmentId, {
            fileName: file.name,
            fileData: reader.result,
          });
          setAssignments(prev =>
            prev.map(a => a.id === assignmentId ? {
              ...a,
              status: 'submitted',
              submittedAt: new Date().toISOString(),
            } : a)
          );
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        alert(err.message || 'Failed to submit assignment');
      } finally {
        setSubmitting(null);
      }
    };

    fileInput.click();
  }

  function confirmLeave() {
    setShowLeaveWarning(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }

  function cancelLeave() {
    setShowLeaveWarning(false);
    setPendingNavigation(null);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-primary-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'submitted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'graded':
        return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">View and manage Assignments</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchAssignments}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-1">View and manage Assignments</p>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No assignments yet</p>
          <p className="text-gray-400 text-sm mt-1">Assignments will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">{assignment.subject}</p>
                    <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                    {getStatusIcon(assignment.status)}
                    {assignment.status}
                  </span>
                  {assignment.score !== undefined && (
                    <span className="text-sm font-bold text-primary-600">
                      Score: {assignment.score}%
                    </span>
                  )}
                </div>
              </div>
              {assignment.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => submitAssignment(assignment.id)}
                    disabled={submitting === assignment.id}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {submitting === assignment.id ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showLeaveWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Page?</h3>
              <p className="text-gray-600">You are currently submitting an assignment. If you leave now, the submission may be interrupted. Do you want to continue?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelLeave}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
              >
                Continue Submission
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium"
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
