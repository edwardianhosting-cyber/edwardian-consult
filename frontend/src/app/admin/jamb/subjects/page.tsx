'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, BookOpen, Upload, Download } from 'lucide-react';

interface JambSubject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  source?: 'jamb-subject' | 'study-subject';
}

export default function AdminJambSubjectsPage() {
  const [subjects, setSubjects] = useState<JambSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      setLoading(true);
      const data = await api.adminGetJambSubjects();
      setSubjects(data.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(subject: JambSubject) {
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      isActive: subject.isActive,
    });
    setEditingId(subject.id);
    setShowForm(true);
  }

  async function saveSubject(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        isActive: formData.isActive,
      };

      if (editingId) {
        await api.adminUpdateJambSubject(editingId, payload);
      } else {
        await api.adminCreateJambSubject(payload);
      }
      resetForm();
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Failed to save subject');
    }
  }

  async function deleteSubject(id: string) {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.adminDeleteJambSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    }
  }

  async function handleBulkUpload() {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const result = await api.bulkUploadJambSubjects(selectedFile);
      alert(`Successfully uploaded ${result.data?.length || 0} subjects`);
      setSelectedFile(null);
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Failed to upload subjects');
    } finally {
      setUploading(false);
    }
  }

  function downloadSampleCsv() {
    const csv = 'subject_name,subject_code,description\nEnglish Language,ENG,Compulsory for all JAMB candidates\nMathematics,MTH,General Mathematics\nPhysics,PHY,Physics for science students';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jamb_subjects_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-900">JAMB Subjects</h1>
          <p className="text-gray-600 mt-1">Manage JAMB examination subjects</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadSampleCsv}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Sample CSV
          </button>
          <label className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload CSV
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>
          {selectedFile && (
            <button
              onClick={handleBulkUpload}
              disabled={uploading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Subject' : 'New Subject'}</h2>
          <form onSubmit={saveSubject} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
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
                {editingId ? 'Update Subject' : 'Create Subject'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Subjects ({subjects.length})</h3>
          <p className="text-sm text-gray-500">
            {subjects.filter(s => s.source === 'study-subject').length} from study materials
          </p>
        </div>
        {subjects.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No subjects yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Source</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary-600" />
                      {subject.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{subject.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{subject.description || '-'}</td>
                    <td className="px-4 py-3">
                      {subject.source === 'study-subject' ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Study Materials</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">JAMB</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${subject.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(subject)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteSubject(subject.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
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
    </div>
  );
}
