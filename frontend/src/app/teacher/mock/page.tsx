'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, FileText, Clock, Eye, Edit, Upload, Trash2, Download, FileUp, X } from 'lucide-react';
import api from '@/lib/api';

interface MockExam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  questions?: any[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  topic?: string;
  difficulty: string;
}

export default function TeacherMockExamPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingExam, setViewingExam] = useState<MockExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    topic: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'json' | 'csv'>('json');
  const [uploadText, setUploadText] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAllMockExams();
      setExams(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mock exams');
    } finally {
      setLoading(false);
    }
  }

  async function viewExamQuestions(exam: MockExam) {
    setViewingExam(exam);
    setQuestionsLoading(true);
    try {
      const res = await api.getMockExamQuestions(exam.id);
      setQuestions(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }

  function openAddQuestionModal() {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: '',
      topic: '',
      difficulty: 'MEDIUM',
    });
    setShowQuestionModal(true);
  }

  function openEditQuestionModal(question: Question) {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      options: question.options,
      correctOption: question.correctOption,
      explanation: question.explanation || '',
      topic: question.topic || '',
      difficulty: question.difficulty,
    });
    setShowQuestionModal(true);
  }

  async function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!viewingExam) return;
    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, {
          ...questionForm,
          subject: viewingExam.subject,
          examType: 'MOCK',
        });
      } else {
        await api.createQuestion({
          ...questionForm,
          subject: viewingExam.subject,
          examType: 'MOCK',
        });
      }
      setShowQuestionModal(false);
      viewExamQuestions(viewingExam);
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'Failed to save question');
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.removeQuestionFromMockExam(viewingExam!.id, questionId);
      viewExamQuestions(viewingExam);
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  }

  async function handleAddExistingQuestions() {
    if (!viewingExam) return;
    const subject = viewingExam.subject;
    const res = await api.getQuestions({ subject, examType: 'MOCK' });
    const allQuestions = res.data || [];
    const currentIds = new Set(questions.map(q => q.id));
    const availableQuestions = allQuestions.filter((q: any) => !currentIds.has(q.id));

    if (availableQuestions.length === 0) {
      alert('No more questions available for this subject');
      return;
    }

    const selectedIds = prompt(`Enter question IDs to add (comma-separated):\n\nAvailable IDs:\n${availableQuestions.map((q: any) => q.id).join(', ')}`);
    if (!selectedIds) return;

    const idsToAdd = selectedIds.split(',').map(id => id.trim()).filter(Boolean);
    try {
      await api.addQuestionsToMockExam(viewingExam.id, idsToAdd);
      viewExamQuestions(viewingExam);
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'Failed to add questions');
    }
  }

  function downloadSampleJSON() {
    const sample = {
      questions: [
        {
          text: "What is the capital of Nigeria?",
          options: ["Lagos", "Abuja", "Kano", "Port Harcourt"],
          correctOption: 1,
          topic: "Geography",
          difficulty: "EASY",
          explanation: "Abuja is the capital city of Nigeria."
        },
        {
          text: "Solve for x: 2x + 5 = 13",
          options: ["x = 3", "x = 4", "x = 5", "x = 6"],
          correctOption: 1,
          topic: "Mathematics",
          difficulty: "MEDIUM",
          explanation: "2x = 8, so x = 4"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-questions-sample.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadSampleCSV() {
    const sample = `text,options,correctOption,topic,difficulty,explanation
"What is the capital of Nigeria?","Lagos|Abuja|Kano|Port Harcourt",1,Geography,EASY,"Abuja is the capital city of Nigeria."
"Solve for x: 2x + 5 = 13","x = 3|x = 4|x = 5|x = 6",1,Mathematics,MEDIUM,"2x = 8, so x = 4"`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-questions-sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadText(content);
    };
    reader.readAsText(file);
  }

  async function handleUploadSubmit() {
    if (!viewingExam || !uploadText.trim()) return;

    setUploadLoading(true);
    setUploadError(null);

    try {
      let questionsToUpload: any[] = [];

      if (uploadType === 'json') {
        const parsed = JSON.parse(uploadText);
        const rawQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        
        questionsToUpload = rawQuestions.map((q: any) => ({
          text: q.text || q.question || '',
          options: Array.isArray(q.options) ? q.options : (q.options ? String(q.options).split('|') : ['', '', '', '']),
          correctOption: parseInt(q.correctOption ?? q.answer ?? 0),
          topic: q.topic || '',
          difficulty: q.difficulty || 'MEDIUM',
          explanation: q.explanation || '',
          subject: viewingExam!.subject,
          examType: 'MOCK',
        }));

        questionsToUpload = questionsToUpload.filter(q => q.text && q.options.length >= 2);
      } else {
        const lines = uploadText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
          
          const question: any = {
            subject: viewingExam!.subject,
            examType: 'MOCK',
          };

          headers.forEach((header, idx) => {
            const value = values[idx] || '';
            if (header === 'options') {
              question.options = value.split('|');
            } else if (header === 'correctOption') {
              question.correctOption = parseInt(value) || 0;
            } else {
              question[header] = value;
            }
          });

          if (question.text && question.options && question.options.length >= 2) {
            questionsToUpload.push(question);
          }
        }
      }

      if (questionsToUpload.length === 0) {
        throw new Error('No valid questions found in the file');
      }

      const uploaded = await api.uploadQuestionsToMockExam(viewingExam.id, questionsToUpload);
      setQuestions(uploaded);
      setShowUploadModal(false);
      setUploadText('');
      fetchExams();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse or upload questions');
    } finally {
      setUploadLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mock Exams</h1>
          <p className="text-gray-600 mt-1">Manage mock examination questions</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchExams} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mock Exams</h1>
        <p className="text-gray-600 mt-1">Manage mock examination questions</p>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No mock exams available</p>
          <p className="text-gray-400 text-sm mt-1">The admin will create mock exams for you to add questions</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              onClick={() => viewExamQuestions(exam)}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {exam.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{exam.subject}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exam.duration} mins
                </span>
                <span>{exam.totalQuestions} questions</span>
              </div>
              <button className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Questions
              </button>
            </div>
          ))}
        </div>
      )}

      {/* View Questions Modal */}
      {viewingExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingExam.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {viewingExam.subject} • {viewingExam.duration} mins • {viewingExam.totalMarks} marks
                </p>
              </div>
              <button onClick={() => { setViewingExam(null); setQuestions([]); }} className="text-gray-400 hover:text-gray-600 text-xl">
                ✕
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={openAddQuestionModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
              <button
                onClick={handleAddExistingQuestions}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                Add Existing Questions
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileUp className="w-4 h-4" />
                Upload Questions
              </button>
              <button
                onClick={downloadSampleJSON}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Sample JSON
              </button>
            </div>

            {questionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No questions added yet</p>
                <p className="text-gray-400 text-sm mt-1">Click "Add Question" or "Upload Questions" to add questions to this exam</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">Q{idx + 1}: {q.text}</p>
                        <div className="text-sm text-gray-600 ml-4 mb-2">
                          {q.options.map((opt, i) => (
                            <div key={i} className={i === q.correctOption ? 'text-green-600 font-medium' : ''}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-sm text-gray-500 ml-4 mt-2">Explanation: {q.explanation}</p>
                        )}
                        {q.topic && (
                          <p className="text-xs text-gray-400 ml-4 mt-1">Topic: {q.topic} • {q.difficulty}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditQuestionModal(q)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h2>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600 w-6">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[idx] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="radio"
                      name="correctOption"
                      checked={questionForm.correctOption === idx}
                      onChange={() => setQuestionForm({ ...questionForm, correctOption: idx })}
                      title="Mark as correct answer"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-1">Select the radio button next to the correct answer</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic (optional)</label>
                <input
                  type="text"
                  value={questionForm.topic}
                  onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
                <textarea
                  rows={2}
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {editingQuestion ? 'Update' : 'Add'} Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Questions Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upload Questions</h2>
              <button onClick={() => { setShowUploadModal(false); setUploadText(''); setUploadError(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setUploadType('json'); setUploadText(''); }}
                className={`px-4 py-2 rounded-lg ${uploadType === 'json' ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
              >
                JSON
              </button>
              <button
                onClick={() => { setUploadType('csv'); setUploadText(''); }}
                className={`px-4 py-2 rounded-lg ${uploadType === 'csv' ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
              >
                CSV
              </button>
              <button
                onClick={uploadType === 'json' ? downloadSampleJSON : downloadSampleCSV}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ml-auto"
              >
                <Download className="w-4 h-4" />
                Download Sample {uploadType.toUpperCase()}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept={uploadType === 'json' ? '.json' : '.csv'}
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or paste content here</label>
              <textarea
                rows={12}
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder={uploadType === 'json' 
                  ? JSON.stringify({ questions: [{ text: "", options: ["", "", "", ""], correctOption: 0 }] }, null, 2)
                  : 'text,options,correctOption,topic,difficulty,explanation\n"What is 2+2?","2|3|4|5",2,Mathematics,EASY,"2+2=4"'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {uploadError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowUploadModal(false); setUploadText(''); setUploadError(null); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploadLoading || !uploadText.trim()}
                className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadLoading ? 'Uploading...' : 'Upload Questions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
