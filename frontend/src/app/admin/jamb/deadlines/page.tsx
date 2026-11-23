'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, Calendar, Clock } from 'lucide-react';

interface JambDeadline {
  id: string;
  event: string;
  date: string;
  description: string;
  isActive: boolean;
  order: number;
}

export default function AdminJambDeadlinesPage() {
  const [deadlines, setDeadlines] = useState<JambDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    event: '',
    date: '',
    description: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchDeadlines();
  }, []);

  async function fetchDeadlines() {
    try {
      setLoading(true);
      const data = await api.adminGetJambDeadlines();
      setDeadlines(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch deadlines');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      event: '',
      date: '',
      description: '',
      isActive: true,
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(deadline: JambDeadline) {
    setFormData({
      event: deadline.event,
      date: deadline.date.split('T')[0],
      description: deadline.description,
      isActive: deadline.isActive,
      order: deadline.order,
    });
    setEditingId(deadline.id);
    setShowForm(true);
  }

  async function saveDeadline(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        event: formData.event,
        date: new Date(formData.date).toISOString(),
        description: formData.description,
        isActive: formData.isActive,
        order: formData.order,
      };

      if (editingId) {
        await api.adminUpdateJambDeadline(editingId, payload);
      } else {
        await api.adminCreateJambDeadline(payload);
      }
      resetForm();
      fetchDeadlines();
    } catch (err: any) {
      alert(err.message || 'Failed to save deadline');
    }
  }

  async function deleteDeadline(id: string) {
    if (!confirm('Delete this deadline?')) return;
    try {
      await api.adminDeleteJambDeadline(id);
      setDeadlines(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete deadline');
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
          <h1 className="text-2xl font-bold text-gray-900">JAMB Deadlines</h1>
          <p className="text-gray-600 mt-1">Manage JAMB examination deadlines and important dates</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Deadline
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Deadline' : 'New Deadline'}</h2>
          <form onSubmit={saveDeadline} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <label className="flex items-center gap-2 mt-6">
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
                {editingId ? 'Update Deadline' : 'Create Deadline'}
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Event</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Description</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deadlines.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No deadlines yet
                </td>
              </tr>
            ) : (
              deadlines.map((deadline) => (
                <tr key={deadline.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    {deadline.event}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(deadline.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{deadline.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{deadline.order}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${deadline.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {deadline.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(deadline)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDeadline(deadline.id)}
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
