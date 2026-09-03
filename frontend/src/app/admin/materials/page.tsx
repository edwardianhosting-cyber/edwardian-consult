'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, Plus, Edit2, Trash2, X, Save, Upload, FileText, Video, Music, Type } from 'lucide-react';
import { studyApi, api } from '@/lib/api';

interface StudyResource {
  id: string;
  title: string;
  type: string;
  fileUrl?: string;
  imageUrl?: string;
  textContent?: string;
  description?: string;
  duration?: number;
  order: number;
}

interface StudyTopic {
  id: string;
  name: string;
  description?: string;
  order: number;
  resources: StudyResource[];
}

interface StudySubject {
  id: string;
  name: string;
  description?: string;
  code?: string;
  gradeLevel?: string;
  isActive: boolean;
  topics: StudyTopic[];
}

type View = 'subjects' | 'topics' | 'resources';
type ModalType = 'subject' | 'topic' | 'resource' | null;

export default function AdminMaterialsPage() {
  const [view, setView] = useState<View>('subjects');
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<StudySubject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<StudySubject | StudyTopic | StudyResource | null>(null);

  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', code: '', gradeLevel: '', isActive: true });
  const [topicForm, setTopicForm] = useState({ name: '', description: '', order: 0 });
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'TEXT', description: '', order: 0, fileUrl: '', imageUrl: '', textContent: '' });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (view === 'subjects') fetchSubjects();
    else if (view === 'topics' && selectedSubject) fetchTopics(selectedSubject.id);
    else if (view === 'resources' && selectedTopic) fetchResources(selectedTopic.id);
  }, [view]);

  async function fetchSubjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await studyApi.getSubjects();
      setSubjects(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTopics(subjectId: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await studyApi.getTopics(subjectId);
      const topics = (data.data || []) as StudyTopic[];
      if (selectedSubject && selectedSubject.id === subjectId) {
        setSelectedSubject({ ...selectedSubject, topics });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  }

  async function fetchResources(topicId: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await studyApi.getResources(topicId);
      const resources = (data.data || []) as StudyResource[];
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic({ ...selectedTopic, resources });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }

  function openSubjectModal(subject?: StudySubject) {
    if (subject) {
      setEditingItem(subject);
      setSubjectForm({ name: subject.name, description: subject.description || '', code: subject.code || '', gradeLevel: subject.gradeLevel || '', isActive: subject.isActive });
    } else {
      setEditingItem(null);
      setSubjectForm({ name: '', description: '', code: '', gradeLevel: '', isActive: true });
    }
    setModalType('subject');
  }

  function openTopicModal(topic?: StudyTopic) {
    if (topic) {
      setEditingItem(topic);
      setTopicForm({ name: topic.name, description: topic.description || '', order: topic.order });
    } else {
      setEditingItem(null);
      setTopicForm({ name: '', description: '', order: 0 });
    }
    setModalType('topic');
  }

  function openResourceModal(resource?: StudyResource) {
    if (resource) {
      setEditingItem(resource);
      setResourceForm({ title: resource.title, type: resource.type, description: resource.description || '', order: resource.order, fileUrl: resource.fileUrl || '', imageUrl: resource.imageUrl || '', textContent: resource.textContent || '' });
    } else {
      setEditingItem(null);
      setResourceForm({ title: '', type: 'TEXT', description: '', order: 0, fileUrl: '', imageUrl: '', textContent: '' });
    }
    setSelectedFile(null);
    setModalType('resource');
  }

  function closeModal() {
    setModalType(null);
    setEditingItem(null);
    setSelectedFile(null);
  }

  async function handleSubjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingItem && 'name' in editingItem) {
        await studyApi.updateSubject(editingItem.id, subjectForm);
        setSuccess('Subject updated');
      } else {
        await studyApi.createSubject(subjectForm);
        setSuccess('Subject created');
      }
      closeModal();
      fetchSubjects();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  }

  async function handleTopicSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubject) return;
    setSaving(true);
    setError(null);
    try {
      const data = { ...topicForm, subjectId: selectedSubject.id };
      if (editingItem && 'name' in editingItem) {
        await studyApi.updateTopic(editingItem.id, data);
        setSuccess('Topic updated');
      } else {
        await studyApi.createTopic(data);
        setSuccess('Topic created');
      }
      closeModal();
      fetchTopics(selectedSubject.id);
    } catch (err: any) {
      setError(err.message || 'Failed to save topic');
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload() {
    if (!selectedFile || !selectedTopic) return;
    setUploadingFile(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', resourceForm.type.toLowerCase());
      formData.append('topicId', selectedTopic.id);
      formData.append('title', resourceForm.title);
      formData.append('description', resourceForm.description);
      formData.append('order', String(resourceForm.order));

      const result = await api.uploadMaterialFile(selectedFile);
      setSuccess('Resource uploaded successfully');
      closeModal();
      fetchResources(selectedTopic.id);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleResourceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTopic) return;
    setSaving(true);
    setError(null);
    try {
      const data = {
        ...resourceForm,
        topicId: selectedTopic.id,
      };
      if (editingItem && 'title' in editingItem) {
        await studyApi.updateResource(editingItem.id, data);
        setSuccess('Resource updated');
      } else {
        if (!resourceForm.fileUrl && !selectedFile) {
          setError('Please upload a file or provide a URL');
          setSaving(false);
          return;
        }
        await studyApi.createResource(data);
        setSuccess('Resource created');
      }
      closeModal();
      fetchResources(selectedTopic.id);
    } catch (err: any) {
      setError(err.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubject(id: string) {
    if (!confirm('Delete this subject? All topics and resources will also be removed.')) return;
    setSaving(true);
    try {
      await studyApi.deleteSubject(id);
      setSuccess('Subject deleted');
      fetchSubjects();
    } catch (err: any) {
      setError(err.message || 'Failed to delete subject');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTopic(id: string) {
    if (!confirm('Delete this topic? All resources will also be removed.')) return;
    setSaving(true);
    try {
      await studyApi.deleteTopic(id);
      setSuccess('Topic deleted');
      if (selectedSubject) fetchTopics(selectedSubject.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete topic');
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(id: string) {
    if (!confirm('Delete this resource?')) return;
    setSaving(true);
    try {
      await studyApi.deleteResource(id);
      setSuccess('Resource deleted');
      if (selectedTopic) fetchResources(selectedTopic.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete resource');
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (view === 'resources') {
      setView('topics');
      setSelectedTopic(null);
    } else if (view === 'topics') {
      setView('subjects');
      setSelectedSubject(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-600 mt-1">
            {view === 'subjects' && 'Manage subjects'}
            {view === 'topics' && selectedSubject && `Manage topics for ${selectedSubject.name}`}
            {view === 'resources' && selectedTopic && `Manage resources for ${selectedTopic.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {view !== 'subjects' && (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (view === 'subjects') openSubjectModal();
              else if (view === 'topics') openTopicModal();
              else if (view === 'resources') openResourceModal();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add {view === 'subjects' ? 'Subject' : view === 'topics' ? 'Topic' : 'Resource'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Breadcrumb */}
      {view !== 'subjects' && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => { setView('subjects'); setSelectedSubject(null); setSelectedTopic(null); }} className="hover:text-primary-600">
            Subjects
          </button>
          {view === 'topics' && selectedSubject && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{selectedSubject.name}</span>
            </>
          )}
          {view === 'resources' && selectedSubject && selectedTopic && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => { setView('topics'); setSelectedTopic(null); }} className="hover:text-primary-600">
                {selectedSubject.name}
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{selectedTopic.name}</span>
            </>
          )}
        </div>
      )}

      {/* Subjects View */}
      {view === 'subjects' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No subjects found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Grade Level</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Topics</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{subject.code || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{subject.gradeLevel || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{subject.topics?.length || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${subject.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedSubject(subject); setView('topics'); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded" title="View topics">
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button onClick={() => openSubjectModal(subject)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
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
      )}

      {/* Topics View */}
      {view === 'topics' && selectedSubject && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : selectedSubject.topics.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No topics found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Description</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Resources</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Order</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSubject.topics.map((topic) => (
                    <tr key={topic.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{topic.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{topic.description || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{topic.resources?.length || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{topic.order}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedTopic(topic); setView('resources'); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded" title="View resources">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => openTopicModal(topic)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTopic(topic.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
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
      )}

      {/* Resources View */}
      {view === 'resources' && selectedTopic && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : selectedTopic.resources.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No resources found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">File/Image</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Text Content</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Order</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTopic.resources.map((resource) => (
                    <tr key={resource.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{resource.title}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase">{resource.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {resource.fileUrl ? <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">File</a> : '-'}
                        {resource.imageUrl && <span className="ml-2 text-xs text-gray-400">Image</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {resource.textContent ? `${resource.textContent.slice(0, 50)}...` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{resource.order}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openResourceModal(resource)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteResource(resource.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
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
      )}

      {/* Subject Modal */}
      {modalType === 'subject' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                <input type="text" value={subjectForm.gradeLevel} onChange={(e) => setSubjectForm({ ...subjectForm, gradeLevel: e.target.value })} placeholder="e.g. SSS1-SSS3" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="subjectActive" checked={subjectForm.isActive} onChange={(e) => setSubjectForm({ ...subjectForm, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                <label htmlFor="subjectActive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {modalType === 'topic' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit Topic' : 'Add Topic'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTopicSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={topicForm.order} onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {modalType === 'resource' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit Resource' : 'Add Resource'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleResourceSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value="TEXT">Text Notes</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                  <option value="PDF">PDF</option>
                  <option value="WORD">Word Document</option>
                  <option value="IMAGE">Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF, Word, Video, Audio)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.mp4,.mp3,.wav" className="hidden" id="resourceFile" />
                  <label htmlFor="resourceFile" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{selectedFile ? selectedFile.name : 'Click to upload file'}</p>
                    <p className="text-xs text-gray-400 mt-1">PDF and Word files will be auto-converted</p>
                  </label>
                </div>
              </div>
              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="font-medium">Auto-processing enabled:</p>
                  <ul className="list-disc list-inside mt-1 text-xs">
                    {resourceForm.type === 'PDF' && <li>PDF will be converted to image and text extracted</li>}
                    {resourceForm.type === 'WORD' && <li>Word document text will be extracted</li>}
                    {(resourceForm.type === 'VIDEO' || resourceForm.type === 'AUDIO') && <li>File will be streamed directly (not downloadable)</li>}
                  </ul>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or provide File URL</label>
                <input type="text" value={resourceForm.fileUrl} onChange={(e) => setResourceForm({ ...resourceForm, fileUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or provide Image URL (for PDF preview)</label>
                <input type="text" value={resourceForm.imageUrl} onChange={(e) => setResourceForm({ ...resourceForm, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                <textarea value={resourceForm.textContent} onChange={(e) => setResourceForm({ ...resourceForm, textContent: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={resourceForm.order} onChange={(e) => setResourceForm({ ...resourceForm, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || uploadingFile} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {uploadingFile ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
