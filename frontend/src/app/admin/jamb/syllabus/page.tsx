'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, BookOpen, Search } from 'lucide-react';
import api from '@/lib/api';

interface SyllabusTopic {
  name: string;
  subtopics: string[];
}

interface SyllabusSubject {
  id: string;
  subject: string;
  topics: SyllabusTopic[];
  year: number;
}

interface JambSubject {
  id: string;
  name: string;
  code: string;
}

export default function AdminJambSyllabusPage() {
  const [subjects, setSubjects] = useState<JambSubject[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    year: new Date().getFullYear(),
    topics: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [subjectsData, syllabusData] = await Promise.all([
        api.adminGetJambSubjects(),
        api.adminGetJambSyllabus(),
      ]);
      setSubjects(subjectsData.data || []);
      setSyllabus(syllabusData.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      subject: '',
      year: new Date().getFullYear(),
      topics: '',
    });
    setEditingId(null);
    setSelectedSubjectId(null);
    setShowForm(false);
  }

  function getSyllabusForSubject(subjectName: string): SyllabusSubject | undefined {
    return syllabus.find(s => s.subject.toLowerCase() === subjectName.toLowerCase());
  }

  function openCreateForSubject(subject: JambSubject) {
    const existing = getSyllabusForSubject(subject.name);
    if (existing) {
      startEdit(existing);
    } else {
      setFormData({
        subject: subject.name,
        year: new Date().getFullYear(),
        topics: '',
      });
      setSelectedSubjectId(subject.id);
      setEditingId(null);
      setShowForm(true);
    }
  }

  function startEdit(item: SyllabusSubject) {
    setFormData({
      subject: item.subject,
      year: item.year,
      topics: item.topics.map(t => `${t.name}|${t.subtopics.join(';')}`).join('\n'),
    });
    const subject = subjects.find(s => s.name.toLowerCase() === item.subject.toLowerCase());
    setSelectedSubjectId(subject?.id || null);
    setEditingId(item.id);
    setShowForm(true);
  }

  function parseTopics(text: string): SyllabusTopic[] {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const [name, ...subtopicParts] = line.split('|');
      return {
        name: name.trim(),
        subtopics: subtopicParts.join('|').split(';').map(s => s.trim()).filter(Boolean),
      };
    });
  }

  async function saveSyllabus(e: React.FormEvent) {
    e.preventDefault();
    try {
      const topics = parseTopics(formData.topics);
      const payload = {
        subject: formData.subject,
        year: formData.year,
        topics,
      };

      if (editingId) {
        await api.adminUpdateJambSyllabus(editingId, payload);
      } else {
        await api.adminCreateJambSyllabus(payload);
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save syllabus');
    }
  }

  async function deleteSyllabus(id: string) {
    if (!confirm('Delete this syllabus?')) return;
    try {
      await api.adminDeleteJambSyllabus(id);
      setSyllabus(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete syllabus');
    }
  }

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">JAMB Syllabus</h1>
          <p className="text-gray-600 mt-1">Manage syllabus for each JAMB subject</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Syllabus' : 'Add Syllabus'} {formData.subject ? `- ${formData.subject}` : ''}
          </h2>
          <form onSubmit={saveSyllabus} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  disabled={!!editingId}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 ${editingId ? 'bg-gray-100' : ''}`}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
              <p className="text-xs text-gray-500 mb-2">Format: Topic Name|Subtopic 1;Subtopic 2;Subtopic 3 (one topic per line)</p>
              <textarea
                required
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={8}
                placeholder="Algebra|Equations;Polynomials;Inequalities&#10;Geometry|Plane geometry;Coordinate geometry;Trigonometry"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => {
          const existingSyllabus = getSyllabusForSubject(subject.name);
          return (
            <div
              key={subject.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{subject.code}</p>
                  {existingSyllabus ? (
                    <div className="mt-3">
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {existingSyllabus.topics.length} topics • {existingSyllabus.year}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-3 inline-block">
                      No syllabus yet
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openCreateForSubject(subject)}
                  className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {existingSyllabus ? 'Edit' : 'Add'} Syllabus
                </button>
                {existingSyllabus && (
                  <button
                    onClick={() => deleteSyllabus(existingSyllabus.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    title="Delete syllabus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No subjects found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery ? 'Try a different search term' : 'Add JAMB subjects first'}
          </p>
        </div>
      )}
    </div>
  );
}
