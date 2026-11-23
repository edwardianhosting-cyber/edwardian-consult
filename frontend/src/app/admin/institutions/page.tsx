'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, Upload, School, MapPin } from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  abbreviation?: string;
  type: string;
  location?: string;
  state?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  isActive: boolean;
  courses: any[];
}

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    type: 'University',
    location: '',
    state: '',
    website: '',
    logo: '',
    coverImage: '',
    description: '',
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  async function fetchInstitutions() {
    try {
      setLoading(true);
      const data = await api.getInstitutions();
      setInstitutions(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch institutions');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      abbreviation: '',
      type: 'University',
      location: '',
      state: '',
      website: '',
      logo: '',
      coverImage: '',
      description: '',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(inst: Institution) {
    setFormData({
      name: inst.name,
      abbreviation: inst.abbreviation || '',
      type: inst.type,
      location: inst.location || '',
      state: inst.state || '',
      website: inst.website || '',
      logo: inst.logo || '',
      coverImage: inst.coverImage || '',
      description: inst.description || '',
    });
    setEditingId(inst.id);
    setShowForm(true);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const res = await api.uploadImage(file, 'institutions/logos');
      setFormData(prev => ({ ...prev, logo: (res.data as any).url }));
    } catch (err: any) {
      alert(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const res = await api.uploadImage(file, 'institutions/covers');
      setFormData(prev => ({ ...prev, coverImage: (res.data as any).url }));
    } catch (err: any) {
      alert(err.message || 'Cover upload failed');
    } finally {
      setUploadingCover(false);
    }
  }

  async function saveInstitution(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        abbreviation: formData.abbreviation,
        type: formData.type,
        location: formData.location,
        state: formData.state,
        website: formData.website,
        logo: formData.logo,
        coverImage: formData.coverImage,
        description: formData.description,
      };

      if (editingId) {
        await api.adminUpdateInstitution(editingId, payload);
      } else {
        await api.adminCreateInstitution(payload);
      }
      resetForm();
      fetchInstitutions();
    } catch (err: any) {
      console.error('Failed to save institution:', err);
      alert(err.message || 'Failed to save institution');
    }
  }

  async function deleteInstitution(id: string) {
    if (!confirm('Delete this institution?')) return;
    try {
      await api.adminDeleteInstitution(id);
      setInstitutions(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete institution');
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
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-600 mt-1">Manage institutions and their courses</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Institution
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Institution' : 'New Institution'}</h2>
          <form onSubmit={saveInstitution} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation</label>
                <input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="University">University</option>
                  <option value="Polytechnic">Polytechnic</option>
                  <option value="College">College</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="flex items-center gap-3">
                {formData.logo && (
                  <img src={formData.logo} alt="Logo" className="w-12 h-12 object-cover rounded-lg border" />
                )}
                <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="flex items-center gap-3">
                {formData.coverImage && (
                  <img src={formData.coverImage} alt="Cover" className="w-20 h-12 object-cover rounded-lg border" />
                )}
                <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploadingCover ? 'Uploading...' : 'Upload Cover'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </label>
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
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Update Institution' : 'Create Institution'}
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Institution</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Courses</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {institutions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No institutions yet
                </td>
              </tr>
            ) : (
              institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    <div className="flex items-center gap-2">
                      {inst.logo && <img src={inst.logo} alt="" className="w-8 h-8 rounded-full object-cover" />}
                      <div>
                        <p>{inst.name}</p>
                        {inst.abbreviation && <p className="text-xs text-gray-500">{inst.abbreviation}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{inst.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {inst.location}{inst.state ? `, ${inst.state}` : ''}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{inst.courses?.length || 0}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(inst)} className="text-blue-500 hover:text-blue-700">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteInstitution(inst.id)} className="text-red-500 hover:text-red-700">
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
