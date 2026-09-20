'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, RefreshCw, CheckCircle, XCircle, AlertTriangle, User, BarChart3 } from 'lucide-react';
import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';

interface ReviewQuestion {
  questionNumber: number;
  questionId: string;
  text: string;
  options: string[];
  correctOption: number;
  userAnswer: number;
  isCorrect: boolean;
  explanation?: string;
  topic?: string;
  subject: string;
  groupType?: string;
  groupId?: string;
}

interface ReviewData {
  result: {
    id: string;
    studentName: string;
    email: string;
    studentEmail: string;
    subject: string;
    type: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    skippedAnswers: number;
    durationUsed: number;
    completedAt: string;
    examTitle: string;
    examId: string;
  };
  questions: ReviewQuestion[];
}

export default function AdminResultReviewPage() {
  const params = useParams();
  const resultId = params.resultId as string;
  const router = useRouter();

  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<Record<string, ReviewQuestion>>({});

  useEffect(() => {
    if (resultId) {
      fetchReviewData();
    }
  }, [resultId]);

  async function fetchReviewData() {
    setLoading(true);
    try {
      const res = await api.adminGetResultReview(resultId);
      const reviewData = (res as any).data || res;
      setData(reviewData);
      setEditedQuestions({});
    } catch (err: any) {
      showError(err.message || 'Failed to load review data');
    } finally {
      setLoading(false);
    }
  }

  function handleQuestionEdit(questionId: string, field: string, value: any) {
    setEditedQuestions(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [field]: value,
      } as ReviewQuestion,
    }));
  }

  async function saveQuestionEdit(questionId: string) {
    const edited = editedQuestions[questionId];
    if (!edited || !data) return;

    setSaving(questionId);
    try {
      const question = data.questions.find(q => q.questionId === questionId);
      if (!question) return;

      await api.adminUpdateExamQuestion(data.result.examId, questionId, {
        text: edited.text,
        options: edited.options,
        correctOption: edited.correctOption,
        explanation: edited.explanation,
      });

      setData(prev => prev ? {
        ...prev,
        questions: prev.questions.map(q =>
          q.questionId === questionId ? { ...q, ...edited } : q
        ),
      } : null);

      setEditedQuestions(prev => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });

      showSuccess('Question updated');
    } catch (err: any) {
      showError(err.message || 'Failed to update question');
    } finally {
      setSaving(null);
    }
  }

  async function handleRecalculate() {
    setRecalculating(true);
    try {
      const res = await api.adminRecalculateResult(resultId);
      const recalcData = (res as any).data || res;
      setData(prev => prev ? {
        ...prev,
        result: {
          ...prev.result,
          score: recalcData.result.score,
          correctAnswers: recalcData.result.correctAnswers,
          wrongAnswers: recalcData.result.wrongAnswers,
          skippedAnswers: recalcData.result.skippedAnswers,
          totalQuestions: recalcData.result.totalQuestions,
        },
        questions: recalcData.corrections.map((c: any) => {
          const existingQuestion = data?.questions.find(q => q.questionNumber === c.questionNumber);
          return {
            questionNumber: c.questionNumber,
            questionId: existingQuestion?.questionId || '',
            text: c.question,
            options: c.options,
            correctOption: c.correctOption,
            userAnswer: c.userAnswer,
            isCorrect: c.isCorrect,
            explanation: c.explanation,
            topic: c.topic,
            subject: c.subject,
            groupType: c.groupType,
            groupId: c.groupId,
          };
        }),
      } : null);
      showSuccess('Result recalculated');
    } catch (err: any) {
      showError(err.message || 'Failed to recalculate result');
    } finally {
      setRecalculating(false);
    }
  }

  function getEffectiveQuestion(q: ReviewQuestion): ReviewQuestion {
    const edited = editedQuestions[q.questionId];
    if (!edited) return q;
    return {
      ...q,
      ...edited,
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Review data not found</h2>
          <button
            onClick={() => router.push('/admin/results')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const effectiveQuestions = data.questions.map(q => getEffectiveQuestion(q));
  const currentScore = data.result.score;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/results')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Attempt</h1>
            <p className="text-gray-600">{data.result.examTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            Recalculate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{data.result.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">System Email:</span>
              <span className="font-medium">{data.result.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gmail:</span>
              <span className="font-medium">{data.result.studentEmail || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subject:</span>
              <span className="font-medium">{data.result.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{data.result.type.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium">{new Date(data.result.completedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Current Score
          </h3>
          <div className="flex items-center justify-center">
            <div className={`text-5xl font-bold ${currentScore >= 70 ? 'text-green-600' : currentScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {Math.round(currentScore)}%
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="font-bold text-green-700">{data.result.correctAnswers}</div>
              <div className="text-xs text-green-600">Correct</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="font-bold text-red-700">{data.result.wrongAnswers}</div>
              <div className="text-xs text-red-600">Wrong</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="font-bold text-gray-700">{data.result.skippedAnswers}</div>
              <div className="text-xs text-gray-600">Skipped</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Questions</h3>
        {effectiveQuestions.map((q, idx) => {
          const isEdited = !!editedQuestions[q.questionId];
          return (
            <div key={q.questionId} className={`bg-white rounded-xl border p-6 ${isEdited ? 'border-yellow-300' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Q{q.questionNumber}</span>
                  {q.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  {isEdited && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Unsaved</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 capitalize">{q.subject}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    value={getEffectiveQuestion(q).text}
                    onChange={e => handleQuestionEdit(q.questionId, 'text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {getEffectiveQuestion(q).options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-bold">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={e => {
                            const newOptions = [...getEffectiveQuestion(q).options];
                            newOptions[optIdx] = e.target.value;
                            handleQuestionEdit(q.questionId, 'options', newOptions);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuestionEdit(q.questionId, 'correctOption', optIdx)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            getEffectiveQuestion(q).correctOption === optIdx
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Correct
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Answer</label>
                    <div className={`px-3 py-2 rounded-lg ${
                      q.userAnswer === -1 ? 'bg-gray-100 text-gray-500' :
                      q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {q.userAnswer === -1 ? 'Unanswered' : String.fromCharCode(65 + q.userAnswer)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                    <textarea
                      value={getEffectiveQuestion(q).explanation || ''}
                      onChange={e => handleQuestionEdit(q.questionId, 'explanation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={2}
                    />
                  </div>
                </div>

                {isEdited && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => saveQuestionEdit(q.questionId)}
                      disabled={saving === q.questionId}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving === q.questionId ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => router.push('/admin/results')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Back to Results
        </button>
        <div className="text-sm text-gray-600">
          Edit questions and click Recalculate to update the score
        </div>
      </div>
    </div>
  );
}
