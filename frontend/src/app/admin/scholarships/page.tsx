'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  provider: string;
  amount?: number;
  currency: string;
  deadline?: string;
  applicationUrl?: string;
  eligibility: any;
  isActive: boolean;
}

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider: '',
    amount: '',
    currency: 'NGN',
    deadline: '',
    applicationUrl: '',
    eligibilityLevel: 'undergraduate',
    eligibilityField: '',
    eligibilityLocation: '',
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  async function fetchScholarships() {
    try {
      setLoading(true);
      const data = await api.getScholarships();
      setScholarships(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch scholarships');
    } finally {
      setLoading(false);
    }
  }

  async function createScholarship(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createScholarship?.({
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        eligibility: {
          level: formData.eligibilityLevel,
          field: formData.eligibilityField || undefined,
          location: formData.eligibilityLocation || undefined,
        },
        deadline: formData.deadline || undefined,
        applicationUrl: formData.applicationUrl || undefined,
      });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        provider: '',
        amount: '',
        currency: 'NGN',
        deadline: '',
        applicationUrl: '',
        eligibilityLevel: 'undergraduate',
        eligibilityField: '',
        eligibilityLocation: '',
      });
      fetchScholarships();
    } catch (err: any) {
      alert(err.message || 'Failed to create scholarship');
    }
  }

  async function deleteScholarship(id: string) {
    if (!confirm('Delete this scholarship?')) return;
    try {
      await api.deleteScholarship?.(id);
      setScholarships(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete scholarship');
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
          <h1 className="text-2xl font-bold text-gray-900">Scholarship Management</h1>
          <p className="text-gray-600 mt-1">Create and manage scholarship opportunities</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Scholarship
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Scholarship</h2>
          <form onSubmit={createScholarship} className="grid sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <input
                type="text"
                required
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option>NGN</option>
                <option>USD</option>
                <option>GBP</option>
              </select>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
              <input
                type="url"
                value={formData.applicationUrl}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Level</label>
              <select
                value={formData.eligibilityLevel}
                onChange={(e) => setFormData({ ...formData, eligibilityLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="undergraduate">Undergraduate</option>
                <option value="secondary">Secondary</option>
                <option value="postgraduate">Postgraduate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
              <input
                type="text"
                value={formData.eligibilityField}
                onChange={(e) => setFormData({ ...formData, eligibilityField: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Create Scholarship
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Provider</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Deadline</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scholarships.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No scholarships yet
                </td>
              </tr>
            ) : (
              scholarships.map((scholarship) => (
                <tr key={scholarship.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{scholarship.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{scholarship.provider}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {scholarship.amount ? `${scholarship.currency} ${scholarship.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      {scholarship.applicationUrl && (
                        <a
                          href={scholarship.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteScholarship(scholarship.id)}
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
