'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { programApi } from '@/lib/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  icon: string;
  imageUrl: string;
  price: number;
  duration: string;
  isActive: boolean;
  order: number;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: '',
    icon: 'BookOpen',
    imageUrl: '',
    price: 0,
    duration: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    try {
      setLoading(true);
      const data = await programApi.getAllAdmin();
      setPrograms(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      features: '',
      icon: 'BookOpen',
      imageUrl: '',
      price: 0,
      duration: '',
      isActive: true,
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(program: Program) {
    setFormData({
      title: program.title,
      description: program.description,
      features: program.features.join('\n'),
      icon: program.icon,
      imageUrl: program.imageUrl,
      price: program.price,
      duration: program.duration,
      isActive: program.isActive,
      order: program.order,
    });
    setEditingId(program.id);
    setShowForm(true);
  }

  async function saveProgram(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        features: formData.features.split('\n').filter(f => f.trim()),
        icon: formData.icon,
        imageUrl: formData.imageUrl,
        price: formData.price,
        duration: formData.duration,
        isActive: formData.isActive,
        order: formData.order,
      };

      if (editingId) {
        await programApi.update(editingId, payload);
      } else {
        await programApi.create(payload);
      }
      resetForm();
      fetchPrograms();
    } catch (err: any) {
      alert(err.message || 'Failed to save program');
    }
  }

  async function deleteProgram(id: string) {
    if (!confirm('Delete this program?')) return;
    try {
      await programApi.delete(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete program');
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
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600 mt-1">Manage programs</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Program
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Program' : 'New Program'}</h2>
          <form onSubmit={saveProgram} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Update Program' : 'Create Program'}
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Duration</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {programs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No programs yet
                </td>
              </tr>
            ) : (
              programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{program.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{program.duration}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${program.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {program.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(program)} className="text-blue-500 hover:text-blue-700">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProgram(program.id)} className="text-red-500 hover:text-red-700">
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
