'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Career {
  id: string;
  title: string;
  description: string;
  requiredSubjects: string[];
  relatedCourses: string[];
  overview?: string;
  requirements?: string;
  skills?: string;
  workEnvironment?: string;
  salaryRange?: string;
  growthProspect?: string;
  suitability?: string;
  isActive: boolean;
}

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSubjects: '',
    relatedCourses: '',
    overview: '',
    requirements: '',
    skills: '',
    workEnvironment: '',
    salaryRange: '',
    growthProspect: '',
    suitability: '',
  });

  useEffect(() => {
    fetchCareers();
  }, []);

  async function fetchCareers() {
    try {
      setLoading(true);
      const data = await api.getCareers();
      const careers = (data.data || []).map((c: any) => ({
        ...c,
        requiredSubjects: Array.isArray(c.requiredSubjects) ? c.requiredSubjects : (c.requiredSubjects ? JSON.parse(c.requiredSubjects) : []),
        relatedCourses: Array.isArray(c.relatedCourses) ? c.relatedCourses : (c.relatedCourses ? JSON.parse(c.relatedCourses) : []),
      }));
      setCareers(careers);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch careers');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      requiredSubjects: '',
      relatedCourses: '',
      overview: '',
      requirements: '',
      skills: '',
      workEnvironment: '',
      salaryRange: '',
      growthProspect: '',
      suitability: '',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(career: Career) {
    const requiredSubjects = Array.isArray(career.requiredSubjects) ? career.requiredSubjects : (career.requiredSubjects ? JSON.parse(career.requiredSubjects) : []);
    const relatedCourses = Array.isArray(career.relatedCourses) ? career.relatedCourses : (career.relatedCourses ? JSON.parse(career.relatedCourses) : []);
    setFormData({
      title: career.title,
      description: career.description,
      requiredSubjects: requiredSubjects.join(', '),
      relatedCourses: relatedCourses.join(', '),
      overview: career.overview || '',
      requirements: career.requirements || '',
      skills: career.skills || '',
      workEnvironment: career.workEnvironment || '',
      salaryRange: career.salaryRange || '',
      growthProspect: career.growthProspect || '',
      suitability: career.suitability || '',
    });
    setEditingId(career.id);
    setShowForm(true);
  }

  async function saveCareer(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        requiredSubjects: formData.requiredSubjects.split(',').map(s => s.trim()).filter(Boolean),
        relatedCourses: formData.relatedCourses.split(',').map(s => s.trim()).filter(Boolean),
        overview: formData.overview || undefined,
        requirements: formData.requirements || undefined,
        skills: formData.skills || undefined,
        workEnvironment: formData.workEnvironment || undefined,
        salaryRange: formData.salaryRange || undefined,
        growthProspect: formData.growthProspect || undefined,
        suitability: formData.suitability || undefined,
      };

      if (editingId) {
        await api.updateCareer(editingId, payload);
      } else {
        await api.createCareer(payload);
      }
      resetForm();
      fetchCareers();
    } catch (err: any) {
      alert(err.message || 'Failed to save career');
    }
  }

  async function deleteCareer(id: string) {
    if (!confirm('Delete this career?')) return;
    try {
      await api.deleteCareer(id);
      setCareers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete career');
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Guidance</h1>
          <p className="text-gray-600 mt-1">Manage career guidance content</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Career
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Career' : 'New Career'}</h2>
          <form onSubmit={saveCareer} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Subjects (comma separated)</label>
                <input
                  type="text"
                  required
                  value={formData.requiredSubjects}
                  onChange={(e) => setFormData({ ...formData, requiredSubjects: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
              <textarea
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suitability (How to know if this is for you)</label>
              <textarea
                value={formData.suitability}
                onChange={(e) => setFormData({ ...formData, suitability: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Environment</label>
                <input
                  type="text"
                  value={formData.workEnvironment}
                  onChange={(e) => setFormData({ ...formData, workEnvironment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Prospect</label>
                <input
                  type="text"
                  value={formData.growthProspect}
                  onChange={(e) => setFormData({ ...formData, growthProspect: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Courses (comma separated)</label>
              <input
                type="text"
                value={formData.relatedCourses}
                onChange={(e) => setFormData({ ...formData, relatedCourses: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Update Career' : 'Create Career'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Description</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Required Subjects</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {careers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No careers yet
                </td>
              </tr>
            ) : (
              careers.map((career) => (
                <tr key={career.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{career.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{career.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {(career.requiredSubjects || []).slice(0, 3).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(career)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCareer(career.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
