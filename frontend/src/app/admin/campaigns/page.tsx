'use client';

import { useEffect, useState } from 'react';
import { Plus, Send, Calendar, Users, Mail, BarChart3, Edit2, Trash2, Play, X } from 'lucide-react';
import api from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  targetType: string;
  targetFilter?: any;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, sent: 0, scheduled: 0, draft: 0 });

  const emptyCampaign = {
    name: '',
    subject: '',
    content: '',
    targetType: 'ALL',
    targetFilter: {},
    scheduledAt: '',
  };

  const [form, setForm] = useState(emptyCampaign);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const data = await api.getCampaigns();
      const campaignsList = data.data?.campaigns || data.data || [];
      setCampaigns(campaignsList);
      setStats({
        total: campaignsList.length,
        sent: campaignsList.filter((c: Campaign) => c.status === 'SENT').length,
        scheduled: campaignsList.filter((c: Campaign) => c.status === 'SCHEDULED').length,
        draft: campaignsList.filter((c: Campaign) => c.status === 'DRAFT').length,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCampaign(null);
    setForm(emptyCampaign);
    setShowModal(true);
  }

  function openEditModal(campaign: Campaign) {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      targetType: campaign.targetType,
      targetFilter: campaign.targetFilter || {},
      scheduledAt: campaign.scheduledAt ? campaign.scheduledAt.slice(0, 16) : '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...form,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      };

      if (editingCampaign) {
        await api.updateCampaign(editingCampaign.id, payload);
      } else {
        await api.createCampaign(payload);
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSend(campaignId: string) {
    if (!confirm('Send this campaign now?')) return;
    try {
      await api.sendCampaign(campaignId);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message || 'Failed to send campaign');
    }
  }

  async function handleDelete(campaignId: string) {
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.deleteCampaign(campaignId);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message || 'Failed to delete campaign');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-100 text-green-700';
      case 'SENDING': return 'bg-blue-100 text-blue-700';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and schedule email campaigns</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Sent</p>
          <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No campaigns yet</p>
            <button onClick={openCreateModal} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Target</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Recipients</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Scheduled</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{campaign.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{campaign.targetType.toLowerCase()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{campaign.recipientCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
                          <button
                            onClick={() => handleSend(campaign.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Send Now"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(campaign)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., June Newsletter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Important Update About Upcoming Exams"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  required
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email content here... Use {{name}} to personalize with recipient's name."
                />
                <p className="text-xs text-gray-500 mt-1">Use {'{{name}}'} to insert recipient's name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={form.targetType}
                  onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Students</option>
                  <option value="JAMB">JAMB Students</option>
                  <option value="WAEC">WAEC Students</option>
                  <option value="NECO">NECO Students</option>
                  <option value="SS3">SS3 Students</option>
                  <option value="PARENTS">Parents</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to save as draft</p>
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
                  {submitting ? 'Saving...' : editingCampaign ? 'Update' : 'Create'} Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
