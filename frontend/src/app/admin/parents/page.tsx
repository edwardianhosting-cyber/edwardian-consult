'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, UserCheck, UserX, X, Download } from 'lucide-react';
import { api } from '@/lib/api';

interface Student {
  id: string;
  fullName: string;
  portalId: string;
  email: string;
  phone: string;
  parentPhone: string | null;
  parentAccessCode: string;
  isActive: boolean;
  createdAt: string;
  admissionYear?: string | null;
}

export default function AdminParentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    parentPhone: '',
    role: 'STUDENT',
    isActive: true,
    password: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers({ role: 'STUDENT', limit: '100' });
      const mapped = (data.data || []).map((s: any) => ({
        id: s.id,
        fullName: s.fullName,
        portalId: s.portalId,
        email: s.email,
        phone: s.phone,
        parentPhone: s.parentPhone || null,
        parentAccessCode: s.parentAccessCode,
        isActive: s.isActive,
        createdAt: s.createdAt,
        admissionYear: s.admissionYear || null,
      }));
      setStudents(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const yearA = a.admissionYear || a.createdAt?.slice(0, 4) || '0';
      const yearB = b.admissionYear || b.createdAt?.slice(0, 4) || '0';
      return yearB.localeCompare(yearA);
    });
  }, [students]);

  const filteredStudents = sortedStudents.filter((student) => {
    const matchesSearch = searchQuery === '' ||
      student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.portalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentAccessCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'active' && student.isActive) ||
      (activeFilter === 'inactive' && !student.isActive);
    return matchesSearch && matchesFilter;
  });

  function openCreateModal() {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      parentPhone: '',
      role: 'STUDENT',
      isActive: true,
      password: '',
    });
    setShowModal(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      parentPhone: student.parentPhone || '',
      role: 'STUDENT',
      isActive: student.isActive,
      password: '',
    });
    setShowModal(true);
  }

  function openViewModal(student: Student) {
    setViewingStudent(student);
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
        parentPhone: formData.parentPhone || null,
        role: 'STUDENT',
        isActive: formData.isActive,
      };

      if (!editingStudent && formData.password) {
        payload.password = formData.password;
      }

      if (editingStudent) {
        await api.updateUser(editingStudent.id, payload);
      } else {
        await api.createUser(payload);
      }
      await fetchStudents();
      setShowModal(false);
      setEditingStudent(null);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        parentPhone: '',
        role: 'STUDENT',
        isActive: true,
        password: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(student: Student) {
    if (!confirm(`Are you sure you want to delete ${student.fullName}?`)) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.deleteUser(student.id);
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(student: Student) {
    setSubmitting(true);
    setError(null);
    try {
      await api.updateUser(student.id, { isActive: !student.isActive });
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
          <p className="text-gray-600 mt-1">Student parent contacts and access codes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
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
            Add Student
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
              placeholder="Search by name, email, portal ID or parent code..."
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
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Parent Phone</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Access Code</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Year</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{student.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{student.fullName}</p>
                          <p className="text-xs text-gray-500">{student.portalId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{student.parentPhone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{student.parentAccessCode}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {student.admissionYear || (student.createdAt ? student.createdAt.slice(0, 4) : '-')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(student)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`p-1.5 rounded ${
                            student.isActive
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={student.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {student.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
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
              <h2 className="text-lg font-semibold">{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {!editingStudent && (
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
                  {submitting ? 'Saving...' : editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Student & Parent Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Student Name</p>
                  <p className="text-sm font-medium text-gray-900">{viewingStudent.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Student ID</p>
                  <p className="text-sm font-medium text-gray-900">{viewingStudent.portalId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-gray-900">{viewingStudent.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{viewingStudent.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Parent Phone</p>
                  <p className="text-sm font-medium text-gray-900">{viewingStudent.parentPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Parent Access Code</p>
                  <p className="text-sm font-medium text-gray-900">{viewingStudent.parentAccessCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    viewingStudent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {viewingStudent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Year</p>
                  <p className="text-sm font-medium text-gray-900">{viewingStudent.admissionYear || (viewingStudent.createdAt ? viewingStudent.createdAt.slice(0, 4) : '-')}</p>
                </div>
              </div>
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
