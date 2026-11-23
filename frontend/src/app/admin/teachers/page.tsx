'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, UserCheck, UserX, X, Download, Key } from 'lucide-react';
import { api } from '@/lib/api';
import { ALL_SUBJECTS } from '@/lib/subjects';

interface Teacher {
  id: string;
  fullName: string;
  portalId: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  examTypes?: string[];
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [resettingPasswordTeacher, setResettingPasswordTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ newPassword: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    isActive: true,
    password: '',
    examTypes: [] as string[],
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers({ role: 'TEACHER', limit: '100' });
      setTeachers(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = searchQuery === '' || 
      teacher.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.portalId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'active' && teacher.isActive) ||
      (activeFilter === 'inactive' && !teacher.isActive);
    return matchesSearch && matchesFilter;
  });

  function openCreateModal() {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'TEACHER',
      isActive: true,
      password: '',
      examTypes: [],
    });
    setShowModal(true);
  }

  function openEditModal(teacher: Teacher) {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      role: 'TEACHER',
      isActive: teacher.isActive,
      password: '',
      examTypes: (teacher.examTypes as string[]) || [],
    });
    setShowModal(true);
  }

  function openViewModal(teacher: Teacher) {
    setViewingTeacher(teacher);
    setShowViewModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: 'TEACHER',
        isActive: formData.isActive,
      };

      if (!editingTeacher && formData.password) {
        payload.password = formData.password;
      }

      if (formData.examTypes.length > 0) {
        payload.examTypes = formData.examTypes;
      }

      if (editingTeacher) {
        await api.updateUser(editingTeacher.id, payload);
      } else {
        await api.createUser(payload);
      }
      await fetchTeachers();
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'TEACHER',
        isActive: true,
        password: '',
        examTypes: [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save teacher');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(teacher: Teacher) {
    if (!confirm(`Are you sure you want to delete ${teacher.fullName}?`)) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.deleteUser(teacher.id);
      await fetchTeachers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete teacher');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(teacher: Teacher) {
    setSubmitting(true);
    setError(null);
    try {
      await api.updateUser(teacher.id, { isActive: !teacher.isActive });
      await fetchTeachers();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(teacher: Teacher) {
    setSubmitting(true);
    setError(null);
    setResetPasswordResult(null);
    try {
      const response = await api.resetUserPassword(teacher.id);
      setResetPasswordResult(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teachers and their assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="printable-area bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No teachers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Portal ID</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subjects</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{teacher.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{teacher.fullName}</p>
                          <p className="text-xs text-gray-500">{teacher.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{teacher.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{teacher.portalId}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {teacher.examTypes?.length ? teacher.examTypes.join(', ') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(teacher)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(teacher)}
                          className={`p-1.5 rounded ${
                            teacher.isActive 
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={teacher.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {teacher.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setResettingPasswordTeacher(teacher); setResetPasswordResult(null); setShowResetPasswordModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Subjects</label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_SUBJECTS.map((subject) => {
                      const checked = formData.examTypes.includes(subject);
                      return (
                        <label key={subject} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = checked
                                ? formData.examTypes.filter((s: string) => s !== subject)
                                : [...formData.examTypes, subject];
                              setFormData({ ...formData, examTypes: next });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="truncate">{subject}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{formData.examTypes.length} selected</p>
              </div>
              {!editingTeacher && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional, auto-generated if empty)</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTeacher ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Teacher Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{viewingTeacher.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Portal ID</p>
                  <p className="text-sm font-medium text-gray-900">{viewingTeacher.portalId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-gray-900">{viewingTeacher.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{viewingTeacher.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned Subjects</p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewingTeacher.examTypes?.length ? viewingTeacher.examTypes.join(', ') : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    viewingTeacher.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {viewingTeacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Joined</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(viewingTeacher.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && resettingPasswordTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <button onClick={() => { setShowResetPasswordModal(false); setResetPasswordResult(null); }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {resetPasswordResult ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">Password reset successful!</p>
                  <p className="text-xs text-green-700 mb-2">Share this new password with the teacher:</p>
                  <div className="bg-white border border-green-200 rounded px-3 py-2 font-mono text-sm text-green-900 break-all">
                    {resetPasswordResult.newPassword}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetPasswordResult.newPassword);
                    }}
                    className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Copy Password
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to reset the password for <strong>{resettingPasswordTeacher.fullName}</strong>?
                  </p>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowResetPasswordModal(false); setResetPasswordResult(null); }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetPassword(resettingPasswordTeacher)}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {submitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-area,
          .printable-area *,
          .printable-area * * {
            visibility: visible !important;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}
