'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Medal, Save, X } from 'lucide-react';
import api from '@/lib/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: any;
  points: number;
  isActive: boolean;
  createdAt: string;
  studentBadges?: { id: string }[];
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyBadge = {
    name: '',
    description: '',
    icon: '🏆',
    category: 'GENERAL',
    requirement: { type: 'custom', value: 1 },
    points: 10,
    isActive: true,
  };

  const [form, setForm] = useState(emptyBadge);

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    try {
      setLoading(true);
      const data = await api.adminGetAllBadges();
      setBadges(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingBadge(null);
    setForm(emptyBadge);
    setShowModal(true);
  }

  function openEditModal(badge: Badge) {
    setEditingBadge(badge);
    setForm({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      requirement: badge.requirement || { type: 'custom', value: 1 },
      points: badge.points,
      isActive: badge.isActive,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingBadge) {
        await api.adminUpdateBadge(editingBadge.id, form);
      } else {
        await api.adminCreateBadge(form);
      }
      setShowModal(false);
      fetchBadges();
    } catch (err: any) {
      setError(err.message || 'Failed to save badge');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this badge? This will also remove it from all students who have earned it.')) return;
    try {
      await api.adminDeleteBadge(id);
      fetchBadges();
    } catch (err: any) {
      alert(err.message || 'Failed to delete badge');
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CBT': return 'bg-blue-100 text-blue-700';
      case 'SCORE': return 'bg-green-100 text-green-700';
      case 'STREAK': return 'bg-orange-100 text-orange-700';
      case 'MILESTONE': return 'bg-purple-100 text-purple-700';
      case 'COMPETITION': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
          <p className="text-gray-600 mt-1">Manage achievement badges</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Badge
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : badges.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No badges found</p>
          <button onClick={openCreateModal} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Create Your First Badge
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{badge.icon}</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(badge)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(badge.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(badge.category)}`}>
                  {badge.category}
                </span>
                <span className="text-xs text-gray-500">{badge.points} pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{badge.studentBadges?.length || 0} earned</span>
                <span className={`text-xs font-medium ${badge.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {badge.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBadge ? 'Edit Badge' : 'New Badge'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    required
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="CBT">CBT</option>
                    <option value="SCORE">Score</option>
                    <option value="STREAK">Streak</option>
                    <option value="MILESTONE">Milestone</option>
                    <option value="COMPETITION">Competition</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Type</label>
                  <select
                    value={(form.requirement as any)?.type || 'custom'}
                    onChange={(e) => setForm({ ...form, requirement: { ...form.requirement, type: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="cbt_count">CBT Count</option>
                    <option value="questions_answered">Questions Answered</option>
                    <option value="score_percent">Score Percentage</option>
                    <option value="streak_days">Study Streak (days)</option>
                    <option value="profile_complete">Profile Complete (%)</option>
                    <option value="leaderboard_rank">Leaderboard Rank</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Value</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={(form.requirement as any)?.value || 1}
                  onChange={(e) => setForm({ ...form, requirement: { ...form.requirement, value: parseInt(e.target.value) || 1 } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="badgeActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="badgeActive" className="text-sm text-gray-700">Active</label>
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
                  {submitting ? 'Saving...' : editingBadge ? 'Update' : 'Create'} Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
