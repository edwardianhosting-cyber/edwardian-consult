'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, Search, GraduationCap, MapPin, Download } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  utmeCutoff?: number;
  olevelRequirements?: string;
  jambSubjects?: string[];
  postUtmeRequired: boolean;
  postUtmeCutoff?: number;
  applicationFee?: number;
  deadline?: string;
  coverImage?: string;
  description?: string;
  isActive: boolean;
  institution: {
    id: string;
    name: string;
    abbreviation?: string;
    type: string;
    location?: string;
    state?: string;
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    institutionId: '',
    name: '',
    utmeCutoff: '',
    olevelRequirements: '',
    jambSubjects: '',
    postUtmeRequired: false,
    postUtmeCutoff: '',
    applicationFee: '',
    deadline: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCourses();
    fetchInstitutions();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (selectedInstitution) params.institutionId = selectedInstitution;
      if (searchQuery) params.search = searchQuery;
      const data = await api.adminGetAllCourses(params);
      setCourses(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }

  async function fetchInstitutions() {
    try {
      const data = await api.getInstitutions();
      setInstitutions(data.data || []);
    } catch (err) {
      console.error('Failed to fetch institutions:', err);
    }
  }

  const handleInstitutionChange = useCallback(async (institutionId: string) => {
    setSelectedInstitution(institutionId);
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (institutionId) params.institutionId = institutionId;
      if (searchQuery) params.search = searchQuery;
      const data = await api.adminGetAllCourses(params);
      setCourses(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (selectedInstitution) params.institutionId = selectedInstitution;
      if (query) params.search = query;
      const data = await api.adminGetAllCourses(params);
      setCourses(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [selectedInstitution]);

  function resetForm() {
    setFormData({
      institutionId: '',
      name: '',
      utmeCutoff: '',
      olevelRequirements: '',
      jambSubjects: '',
      postUtmeRequired: false,
      postUtmeCutoff: '',
      applicationFee: '',
      deadline: '',
      description: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(course: Course) {
    setFormData({
      institutionId: course.institution.id,
      name: course.name,
      utmeCutoff: course.utmeCutoff?.toString() || '',
      olevelRequirements: course.olevelRequirements || '',
      jambSubjects: Array.isArray(course.jambSubjects) ? course.jambSubjects.join(', ') : '',
      postUtmeRequired: course.postUtmeRequired,
      postUtmeCutoff: course.postUtmeCutoff?.toString() || '',
      applicationFee: course.applicationFee?.toString() || '',
      deadline: course.deadline ? course.deadline.split('T')[0] : '',
      description: course.description || '',
      isActive: course.isActive,
    });
    setEditingId(course.id);
    setShowForm(true);
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (!formData.institutionId) {
        setError('Please select an institution');
        return;
      }

      const payload: any = {
        institutionId: formData.institutionId,
        name: formData.name,
        utmeCutoff: formData.utmeCutoff ? parseFloat(formData.utmeCutoff) : undefined,
        olevelRequirements: formData.olevelRequirements || undefined,
        jambSubjects: formData.jambSubjects.split(',').map(s => s.trim()).filter(Boolean),
        postUtmeRequired: formData.postUtmeRequired,
        postUtmeCutoff: formData.postUtmeCutoff ? parseFloat(formData.postUtmeCutoff) : undefined,
        applicationFee: formData.applicationFee ? parseFloat(formData.applicationFee) : undefined,
        deadline: formData.deadline || undefined,
        description: formData.description || undefined,
        isActive: formData.isActive,
      };

      console.log('Saving course with payload:', payload);

      if (editingId) {
        await api.adminUpdateCourse(editingId, payload);
      } else {
        await api.adminCreateCourse(payload);
      }
      resetForm();
      await fetchCourses();
    } catch (err: any) {
      console.error('Save course error:', err);
      setError(err.message || 'Failed to save course');
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course?')) return;
    try {
      await api.adminDeleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete course');
    }
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage institution courses and entry requirements</p>
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
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedInstitution}
            onChange={(e) => handleInstitutionChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Institutions</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Course' : 'New Course'}</h2>
          <form onSubmit={saveCourse} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select
                  required
                  value={formData.institutionId}
                  onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select institution...</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UTME Cutoff</label>
                <input
                  type="number"
                  value={formData.utmeCutoff}
                  onChange={(e) => setFormData({ ...formData, utmeCutoff: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee (₦)</label>
                <input
                  type="number"
                  value={formData.applicationFee}
                  onChange={(e) => setFormData({ ...formData, applicationFee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post-UTME Cutoff (%)</label>
                <input
                  type="number"
                  value={formData.postUtmeCutoff}
                  onChange={(e) => setFormData({ ...formData, postUtmeCutoff: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">O-Level Requirements</label>
              <textarea
                value={formData.olevelRequirements}
                onChange={(e) => setFormData({ ...formData, olevelRequirements: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JAMB Subjects (comma separated)</label>
              <input
                type="text"
                value={formData.jambSubjects}
                onChange={(e) => setFormData({ ...formData, jambSubjects: e.target.value })}
                placeholder="English, Mathematics, Physics, Chemistry"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.postUtmeRequired}
                onChange={(e) => setFormData({ ...formData, postUtmeRequired: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Post-UTME Required</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Update Course' : 'Create Course'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="printable-area bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No courses yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Institution</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">UTME Cutoff</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Post-UTME</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      <div>
                        <p>{course.name}</p>
                        {course.deadline && (
                          <p className="text-xs text-gray-500">Deadline: {new Date(course.deadline).toLocaleDateString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {course.institution.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{course.utmeCutoff || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {course.postUtmeRequired ? `${course.postUtmeCutoff || 'N/A'}%` : 'No'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {course.applicationFee ? `₦${course.applicationFee.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${course.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(course)} className="text-blue-500 hover:text-blue-700">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCourse(course.id)} className="text-red-500 hover:text-red-700">
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
