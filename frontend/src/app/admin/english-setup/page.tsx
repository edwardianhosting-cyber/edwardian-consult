'use client';

import { useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { Plus, Trash2, Edit3, Eye, BookOpen, FileText, Settings, Download } from 'lucide-react';

interface EnglishBlueprint {
  totalQuestions: number;
  comprehensionGroupCount: number;
  clozeGroupCount: number;
  standaloneCount: number;
}

interface QuestionGroup {
  id: string;
  subject: string;
  examType: string;
  groupType: string;
  title?: string;
  instructions?: string;
  passage?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { questions: number };
  questions?: Array<{
    id: string;
    text: string;
    options: string[];
    correctOption: number;
    explanation?: string;
    groupOrder?: number;
  }>;
}

interface GroupQuestion {
  id?: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

const EXAM_TYPES = ['JAMB', 'WAEC', 'NECO', 'POST-UTME', 'MOCK'] as const;
const TABS = [
  { id: 'blueprint', label: 'Exam Blueprint', icon: Settings },
  { id: 'comprehension', label: 'Comprehension Groups', icon: BookOpen },
  { id: 'cloze', label: 'Cloze Groups', icon: FileText },
  { id: 'standalone', label: 'Standalone English Questions', icon: FileText },
] as const;

type TabId = typeof TABS[number]['id'];

export default function EnglishSetupPage() {
  const [activeTab, setActiveTab] = useState<TabId>('blueprint');
  const [blueprint, setBlueprint] = useState<EnglishBlueprint>({
    totalQuestions: 60,
    comprehensionGroupCount: 1,
    clozeGroupCount: 1,
    standaloneCount: 58,
  });
  const [comprehensionGroups, setComprehensionGroups] = useState<QuestionGroup[]>([]);
  const [clozeGroups, setClozeGroups] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState('JAMB');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<QuestionGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    groupType: 'COMPREHENSION' as 'COMPREHENSION' | 'CLOZE',
    title: '',
    instructions: '',
    passage: '',
    imageUrl: '',
    isActive: true,
  });
  const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([]);
  const [standaloneJson, setStandaloneJson] = useState('');
  const [uploadingStandalone, setUploadingStandalone] = useState(false);
  const [standaloneResult, setStandaloneResult] = useState<{ created: number; errors: string[] } | null>(null);

  useEffect(() => {
    fetchBlueprint();
    fetchGroups();
  }, [selectedExamType]);

  async function fetchBlueprint() {
    try {
      const response = await api.getEnglishBlueprint();
      if (response.data) {
        setBlueprint(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch blueprint:', error);
    }
  }

  async function fetchGroups() {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        subject: 'English Language',
        examType: selectedExamType,
      };
      const response = await api.getQuestionGroups(params);
      const allGroups = response.data || [];
      setComprehensionGroups(allGroups.filter((g: QuestionGroup) => g.groupType === 'COMPREHENSION'));
      setClozeGroups(allGroups.filter((g: QuestionGroup) => g.groupType === 'CLOZE'));
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveBlueprint() {
    setSaving(true);
    try {
      await api.updateEnglishBlueprint({
        totalQuestions: blueprint.totalQuestions,
        comprehensionGroupCount: blueprint.comprehensionGroupCount,
        clozeGroupCount: blueprint.clozeGroupCount,
      });
      showSuccess('Blueprint saved successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to save blueprint');
    } finally {
      setSaving(false);
    }
  }

  function openGroupModal(groupType: 'COMPREHENSION' | 'CLOZE', group?: QuestionGroup) {
    setEditingGroup(group || null);
    setGroupForm({
      groupType,
      title: group?.title || '',
      instructions: group?.instructions || '',
      passage: group?.passage || '',
      imageUrl: group?.imageUrl || '',
      isActive: group?.isActive ?? true,
    });

    if (group?.questions && group.questions.length > 0) {
      setGroupQuestions(
        group.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options as string[],
          correctOption: q.correctOption,
          explanation: q.explanation || '',
        }))
      );
    } else {
      setGroupQuestions([{ text: '', options: ['', '', '', ''], correctOption: 0, explanation: '' }]);
    }

    setShowGroupModal(true);
  }

  function addGroupQuestion() {
    setGroupQuestions([...groupQuestions, { text: '', options: ['', '', '', ''], correctOption: 0, explanation: '' }]);
  }

  function updateGroupQuestion(index: number, field: keyof GroupQuestion, value: any) {
    const updated = [...groupQuestions];
    (updated[index] as any)[field] = value;
    setGroupQuestions(updated);
  }

  function updateGroupQuestionOption(questionIndex: number, optionIndex: number, value: string) {
    const updated = [...groupQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setGroupQuestions(updated);
  }

  function removeGroupQuestion(index: number) {
    setGroupQuestions(groupQuestions.filter((_, i) => i !== index));
  }

  async function saveGroup(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let groupId: string;

      if (editingGroup) {
        const updatedGroup = await api.updateQuestionGroup(editingGroup.id, {
          subject: 'English Language',
          examType: selectedExamType,
          groupType: groupForm.groupType,
          title: groupForm.title || undefined,
          instructions: groupForm.instructions || undefined,
          passage: groupForm.passage || undefined,
          imageUrl: groupForm.imageUrl || undefined,
          isActive: groupForm.isActive,
        });
        groupId = editingGroup.id;
        showSuccess('Group updated successfully');
      } else {
        const newGroup = await api.createQuestionGroup({
          subject: 'English Language',
          examType: selectedExamType,
          groupType: groupForm.groupType,
          title: groupForm.title || undefined,
          instructions: groupForm.instructions || undefined,
          passage: groupForm.passage || undefined,
          imageUrl: groupForm.imageUrl || undefined,
          isActive: groupForm.isActive,
        });
        groupId = newGroup.data.id;
        showSuccess('Group created successfully');
      }

      const existingQuestionIds = editingGroup?.questions?.map(q => q.id) || [];
      const currentQuestionIds = groupQuestions.filter(q => q.id).map(q => q.id!);
      const removedQuestionIds = existingQuestionIds.filter(id => !currentQuestionIds.includes(id));

      for (const questionId of removedQuestionIds) {
        try {
          await api.updateQuestion(questionId, { groupId: null, groupType: null, groupOrder: undefined });
        } catch (error) {
          console.error('Failed to remove question from group:', error);
        }
      }

      for (let i = 0; i < groupQuestions.length; i++) {
        const q = groupQuestions[i];
        if (!q.text.trim()) continue;

        const payload: any = {
          subject: 'English Language',
          examType: selectedExamType,
          text: q.text,
          options: q.options.filter(o => o.trim() !== ''),
          correctOption: q.correctOption,
          explanation: q.explanation || null,
          groupType: groupForm.groupType,
          groupId: groupId,
          groupOrder: i,
          isActive: true,
        };

        if (q.id) {
          await api.updateQuestion(q.id, payload);
        } else {
          await api.createQuestion(payload);
        }
      }

      setShowGroupModal(false);
      fetchGroups();
    } catch (error: any) {
      showError(error.message || 'Failed to save group');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm('Are you sure you want to delete this group? Questions in this group will become ungrouped.')) return;
    try {
      await api.deleteQuestionGroup(id);
      showSuccess('Group deleted successfully');
      fetchGroups();
    } catch (error: any) {
      showError(error.message || 'Failed to delete group');
    }
  }

  async function handleStandaloneUpload() {
    if (!standaloneJson.trim()) return;
    setUploadingStandalone(true);
    setStandaloneResult(null);
    try {
      const questions = JSON.parse(standaloneJson);
      const response = await api.uploadQuestionsJson(Array.isArray(questions) ? questions : [questions], {
        subject: 'English Language',
        examType: selectedExamType,
      });
      setStandaloneResult(response.data);
      setStandaloneJson('');
      showSuccess(`Uploaded ${response.data?.created || 0} standalone English questions`);
    } catch (error: any) {
      showError(error.message || 'Failed to upload JSON questions');
    } finally {
      setUploadingStandalone(false);
    }
  }

  function loadSampleStandaloneJson() {
    const sample = [
      {
        text: 'Choose the correct option: She ___ to school every day.',
        options: ['go', 'goes', 'going', 'gone'],
        correctOption: 1,
        explanation: 'Third person singular present tense adds -es.',
      },
      {
        text: 'Identify the figure of speech: "The wind whispered through the trees."',
        options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'],
        correctOption: 2,
        explanation: 'Giving human qualities to non-human things is personification.',
      },
      {
        text: 'What is the past tense of "run"?',
        options: ['runned', 'ran', 'running', 'runs'],
        correctOption: 1,
        explanation: 'The past tense of "run" is "ran".',
      },
    ];
    setStandaloneJson(JSON.stringify(sample, null, 2));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">English Language Setup</h1>
          <p className="text-gray-600 mt-1">Configure English question groups and exam blueprint</p>
        </div>
        <div>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {EXAM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'blueprint' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">English Exam Blueprint</h3>
              <p className="text-sm text-gray-600">
                Configure how English questions are selected for {selectedExamType} exams.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={blueprint.totalQuestions}
                    onChange={(e) => setBlueprint({ ...blueprint, totalQuestions: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comprehension Groups</label>
                  <input
                    type="number"
                    value={blueprint.comprehensionGroupCount}
                    onChange={(e) => setBlueprint({ ...blueprint, comprehensionGroupCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cloze Groups</label>
                  <input
                    type="number"
                    value={blueprint.clozeGroupCount}
                    onChange={(e) => setBlueprint({ ...blueprint, clozeGroupCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standalone Questions</label>
                  <input
                    type="number"
                    value={blueprint.totalQuestions - (blueprint.comprehensionGroupCount * 5) - (blueprint.clozeGroupCount * 7)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Standalone questions are automatically calculated based on the total questions minus the grouped questions.
                  The system assumes an average of 5 questions per comprehension group and 7 questions per cloze group.
                </p>
              </div>
              <button
                onClick={saveBlueprint}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Blueprint'}
              </button>
            </div>
          )}

          {activeTab === 'comprehension' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Comprehension Groups</h3>
                <button
                  onClick={() => openGroupModal('COMPREHENSION')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Group
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Passage</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Questions</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprehensionGroups.map((group) => (
                      <tr key={group.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{group.title || `Group ${group.id.slice(0, 8)}`}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-md truncate">{group.passage?.slice(0, 100) || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{group._count?.questions ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {group.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => window.open(`/admin/english-setup?group=${group.id}`, '_blank')}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openGroupModal('COMPREHENSION', group)}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteGroup(group.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {comprehensionGroups.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No comprehension groups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'cloze' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Cloze Groups</h3>
                <button
                  onClick={() => openGroupModal('CLOZE')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Group
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Passage</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Questions</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clozeGroups.map((group) => (
                      <tr key={group.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{group.title || `Group ${group.id.slice(0, 8)}`}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-md truncate">{group.passage?.slice(0, 100) || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{group._count?.questions ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {group.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => window.open(`/admin/english-setup?group=${group.id}`, '_blank')}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openGroupModal('CLOZE', group)}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteGroup(group.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {clozeGroups.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No cloze groups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'standalone' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Standalone English Questions</h3>
              <p className="text-sm text-gray-600">
                Upload standalone English Language questions via JSON. These questions are not part of any group.
              </p>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">JSON Questions</label>
                  <textarea
                    value={standaloneJson}
                    onChange={(e) => setStandaloneJson(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-xs"
                    placeholder={`Paste JSON here, for example:\n[\n  {\n    "text": "What is the capital of Nigeria?",\n    "options": ["Lagos", "Abuja", "Port Harcourt", "Kano"],\n    "correctOption": 1,\n    "explanation": "Abuja is the capital."\n  }\n]`}
                  />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={loadSampleStandaloneJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-gray-200 rounded-lg hover:bg-primary-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Load Sample JSON
                  </button>
                  <span className="text-xs text-gray-500">Click to load a sample format.</span>
                </div>
                <button
                  type="button"
                  onClick={handleStandaloneUpload}
                  disabled={uploadingStandalone || !standaloneJson.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploadingStandalone ? 'Uploading...' : 'Upload Standalone Questions'}
                </button>
                {standaloneResult && (
                  <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
                    <p className="text-sm font-medium text-green-700 mb-1">Upload Complete</p>
                    <p className="text-xs text-gray-600">Created: {standaloneResult.created} questions</p>
                    {standaloneResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-red-700">Errors:</p>
                        <ul className="text-xs text-red-600 list-disc list-inside max-h-40 overflow-y-auto">
                          {standaloneResult.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGroup ? 'Edit Group' : `Add ${groupForm.groupType === 'COMPREHENSION' ? 'Comprehension' : 'Cloze'} Group`}
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Eye className="w-5 h-5" style={{ display: 'none' }} />
              </button>
            </div>
            <form onSubmit={saveGroup} className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={groupForm.title}
                    onChange={(e) => setGroupForm({ ...groupForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Comprehension Passage 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={groupForm.imageUrl}
                    onChange={(e) => setGroupForm({ ...groupForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea
                  value={groupForm.instructions}
                  onChange={(e) => setGroupForm({ ...groupForm, instructions: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Instructions for students..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passage</label>
                <textarea
                  value={groupForm.passage}
                  onChange={(e) => setGroupForm({ ...groupForm, passage: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter the passage or cloze text here..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="groupIsActive"
                  checked={groupForm.isActive}
                  onChange={(e) => setGroupForm({ ...groupForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="groupIsActive" className="text-sm text-gray-700">Active</label>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900">Questions</h4>
                  <button
                    type="button"
                    onClick={addGroupQuestion}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>
                <div className="space-y-6">
                  {groupQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Question {qIndex + 1}</span>
                        {groupQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGroupQuestion(qIndex)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                        <textarea
                          value={q.text}
                          onChange={(e) => updateGroupQuestion(qIndex, 'text', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter question text..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correctOption-${qIndex}`}
                                checked={q.correctOption === optIndex}
                                onChange={() => updateGroupQuestion(qIndex, 'correctOption', optIndex)}
                                className="w-4 h-4 text-primary-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateGroupQuestionOption(qIndex, optIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                        <textarea
                          value={q.explanation}
                          onChange={(e) => updateGroupQuestion(qIndex, 'explanation', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Explanation for the correct answer..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingGroup ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
