'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Search, Filter, Eye, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { showError } from '@/lib/toast';

interface Application {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  institutionId: string;
  institutionName: string;
  courseId: string;
  choiceNumber?: number;
  status: string;
  utmeScore?: number;
  submittedAt?: string;
  decisionAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminApplicationsPage() {
  const [data, setData] = useState<ApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  async function fetchApplications() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.adminGetAllApplications({
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: 20,
      });
      setData(res.data as ApplicationsResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  }

  async function updateStatus(applicationId: string, status: string) {
    setUpdatingId(applicationId);
    try {
      await api.adminUpdateApplicationStatus(applicationId, status, notesMap[applicationId]);
      await fetchApplications();
    } catch (err: any) {
      showError(err.message || 'Failed to update application');
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'APPROVED':
      case 'ADMITTED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'APPROVED':
      case 'ADMITTED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'SUBMITTED':
        return <Eye className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Manage admission applications</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchApplications} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-1">Manage admission applications</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or institution..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ADMITTED">Admitted</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Search
          </button>
        </form>
      </div>

      {!data || data.applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No applications found</p>
          <p className="text-gray-400 text-sm mt-1">Applications will appear here when students submit them</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Applicant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Institution</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.applications.map((app) => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{app.userName}</p>
                        <p className="text-xs text-gray-500">{app.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{app.institutionName}</td>
                    <td className="py-3 px-4 text-gray-600">{app.courseId}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{app.utmeScore ?? '-'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={notesMap[app.id] || ''}
                          onChange={(e) => setNotesMap({ ...notesMap, [app.id]: e.target.value })}
                          placeholder="Notes (optional)"
                          className="w-32 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                        />
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          disabled={updatingId === app.id}
                          className="px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="SUBMITTED">Submitted</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="ADMITTED">Admitted</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Page {data.page} of {data.totalPages} ({data.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={page === data.totalPages}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
