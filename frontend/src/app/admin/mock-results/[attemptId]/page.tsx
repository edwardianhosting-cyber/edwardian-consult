'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, RefreshCw, Mail, Printer, CheckCircle, XCircle, AlertTriangle, Edit3, BarChart3 } from 'lucide-react';
import api from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

interface Correction {
  questionNumber: number;
  questionId: string;
  question: string;
  options: string[];
  correctOption: number;
  userAnswer: number;
  isCorrect: boolean;
  explanation?: string;
  topic?: string;
  subject: string;
  groupType?: string;
  groupId?: string;
  passage?: string;
  groupTitle?: string;
  groupInstructions?: string;
}

interface MockResultDetail {
  id: string;
  studentName: string;
  email: string;
  studentEmail: string;
  score: number;
  aggregate: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  completedAt: string;
  type: string;
  examTitle: string;
  examId?: string;
  subjectScores: Record<string, { total: number; correct: number }>;
  subjectEntries: { subject: string; score: number; correct: number; total: number }[];
  corrections: Correction[];
}

export default function AdminMockResultDetailPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const router = useRouter();

  const [result, setResult] = useState<MockResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<Record<string, Partial<Correction>>>({});

  useEffect(() => {
    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  async function fetchResult() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.adminGetMockResultDetail(attemptId);
      if ((res as any).data) {
        setResult((res as any).data);
        setEditedQuestions({});
      } else {
        setError('Mock result not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mock result');
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
      } as Partial<Correction>,
    }));
  }

  async function saveQuestionEdit(questionId: string) {
    const edited = editedQuestions[questionId];
    if (!edited || !result) return;

    setSaving(questionId);
    try {
      const question = result.corrections.find(q => q.questionId === questionId);
      if (!question) return;

      await api.adminUpdateExamQuestion(result.examId || '', questionId, {
        text: edited.question || question.question,
        options: edited.options,
        correctOption: edited.correctOption,
        explanation: edited.explanation,
      });

      const merged: Correction = { ...question, ...edited, question: edited.question || question.question } as Correction;

      setResult(prev => prev ? {
        ...prev,
        corrections: prev.corrections.map(q =>
          q.questionId === questionId ? merged : q
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
      const res = await api.adminRecalculateResult(attemptId);
      const recalcData = (res as any).data || res;
      if (recalcData.result && recalcData.corrections) {
        setResult(prev => prev ? {
          ...prev,
          score: recalcData.result.score,
          aggregate: Math.round(
            recalcData.corrections.length > 0
              ? recalcData.corrections.reduce((sum: number, c: any) => sum + (c.isCorrect ? 1 : 0), 0) / recalcData.corrections.length * 100
              : prev.aggregate
          ),
          correctAnswers: recalcData.result.correctAnswers,
          wrongAnswers: recalcData.result.wrongAnswers,
          skippedAnswers: recalcData.result.skippedAnswers,
          corrections: recalcData.corrections.map((c: any) => {
            const existing = prev.corrections.find(q => q.questionNumber === c.questionNumber);
            return {
              questionNumber: c.questionNumber,
              questionId: existing?.questionId || '',
              question: c.question,
              options: c.options,
              correctOption: c.correctOption,
              userAnswer: c.userAnswer,
              isCorrect: c.isCorrect,
              explanation: c.explanation,
              topic: c.topic,
              subject: c.subject,
              groupType: c.groupType,
              groupId: c.groupId,
              passage: c.passage,
              groupTitle: c.groupTitle,
              groupInstructions: c.groupInstructions,
            };
          }),
        } : null);
        showSuccess('Result recalculated');
      } else {
        showSuccess('Result recalculated');
        fetchResult();
      }
    } catch (err: any) {
      showError(err.message || 'Failed to recalculate result');
    } finally {
      setRecalculating(false);
    }
  }

  async function handleSendEmail() {
    if (!result) return;
    setSendingEmail(true);
    try {
      await api.sendMockResultEmail(result.id);
      showSuccess('Mock result email sent successfully to the student');
    } catch (err: any) {
      showError(err.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 70) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
  }

  function getEffectiveQuestion(q: Correction): Correction {
    const edited = editedQuestions[q.questionId];
    if (!edited) return q;
    return {
      ...q,
      ...edited,
      question: edited.question !== undefined ? edited.question : q.question,
      questionNumber: q.questionNumber,
      questionId: q.questionId,
      options: edited.options || q.options,
      correctOption: edited.correctOption !== undefined ? edited.correctOption : q.correctOption,
      userAnswer: q.userAnswer,
      isCorrect: q.isCorrect,
      subject: q.subject,
    };
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mock Exam Result</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review mock examination result</p>
        </div>
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
          <button
            onClick={fetchResult}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mock Exam Result</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review mock examination result</p>
        </div>
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Mock result not found</p>
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

  const corrections = result.corrections || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/results')}
            className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Review Mock Exam</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{result.examTitle}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {sendingEmail ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send to Student
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Result
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Student Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{result.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{result.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gmail</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{result.studentEmail || result.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{result.examTitle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date Submitted</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(result.completedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{result.type?.toLowerCase() || 'mock'}</p>
          </div>
        </div>
      </div>

      {/* Result Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Result Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
            <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.correctAnswers}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4">
            <XCircle className="w-6 h-5 text-red-500 dark:text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.wrongAnswers}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Wrong</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <AlertTriangle className="w-6 h-6 text-gray-500 dark:text-gray-300 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{result.skippedAnswers}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unanswered</p>
          </div>
          <div className={`rounded-xl p-4 ${getScoreColor(result.aggregate)}`}>
            <BarChart3 className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.round(result.aggregate)}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aggregate</p>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      {result.subjectEntries && result.subjectEntries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subject Breakdown</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.subjectEntries.map((entry) => (
              <div key={entry.subject} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{entry.subject}</h3>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(entry.score)}`}>
                    {entry.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{entry.correct} / {entry.total} correct</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrections / Review */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Question Review</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Edit questions and click <strong>Recalculate</strong> to update the score based on edits.
        </p>
        <div className="space-y-4">
          {corrections.map((correction, index) => {
            const isCorrect = correction.isCorrect;
            const isUnanswered = correction.userAnswer === -1;
            const isEdited = !!editedQuestions[correction.questionId];
            const effective = getEffectiveQuestion(correction);

            const prevCorrection = index > 0 ? corrections[index - 1] : null;
            const isNewGroup = correction.groupId && (!prevCorrection || prevCorrection.groupId !== correction.groupId);

            return (
              <div
                key={correction.questionId}
                className={`p-4 rounded-xl border-2 ${
                  isCorrect
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                } ${isEdited ? 'border-yellow-300 dark:border-yellow-600' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Q{correction.questionNumber}: {effective.question}
                      </p>
                      {isEdited && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                          Unsaved
                        </span>
                      )}
                    </div>

                    {/* Passage / Group info for comprehension/cloze questions */}
                    {((isNewGroup && correction.passage) || (!isNewGroup && correction.passage && correction.groupId && corrections[index - 1]?.groupId !== correction.groupId)) && (
                      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        {correction.groupTitle && (
                          <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">{correction.groupTitle}</h3>
                        )}
                        {correction.groupInstructions && (
                          <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">{correction.groupInstructions}</p>
                        )}
                        <div className="text-sm text-yellow-900 dark:text-yellow-100 whitespace-pre-wrap leading-relaxed">{correction.passage}</div>
                      </div>
                    )}

                    {/* Editable Question Text */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Question Text</label>
                      <textarea
                        value={effective.question}
                        onChange={e => handleQuestionEdit(correction.questionId, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        rows={2}
                      />
                    </div>

                    {/* Editable Options */}
                    <div className="space-y-2 mb-3">
                      {effective.options.map((opt, optIndex) => {
                        const isCorrectOption = optIndex === effective.correctOption;
                        const isUserAnswer = optIndex === effective.userAnswer;
                        const isWrongUserAnswer = isUserAnswer && !isCorrectOption;

                        let className = 'flex items-center gap-2 text-sm p-2 rounded ';
                        if (isCorrectOption) {
                          className += 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium';
                        } else if (isWrongUserAnswer) {
                          className += 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
                        } else {
                          className += 'text-gray-600 dark:text-gray-400';
                        }

                        let label = '';
                        if (isCorrectOption && isCorrect) {
                          label = '✓ YOUR ANSWER - CORRECT ANSWER';
                        } else if (isCorrectOption && !isCorrect && !isUnanswered) {
                          label = '✓ CORRECT ANSWER';
                        } else if (isCorrectOption && isUnanswered) {
                          label = '✓ CORRECT ANSWER';
                        } else if (isWrongUserAnswer) {
                          label = '✗ YOUR ANSWER';
                        }

                        return (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-bold">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const newOptions = [...effective.options];
                                newOptions[optIndex] = e.target.value;
                                handleQuestionEdit(correction.questionId, 'options', newOptions);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuestionEdit(correction.questionId, 'correctOption', optIndex)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                effective.correctOption === optIndex
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              Correct
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Student Answer display */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Student Answer</label>
                      <div className={`px-3 py-2 rounded-lg text-sm ${
                        effective.userAnswer === -1
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          : effective.isCorrect
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200'
                      }`}>
                        {effective.userAnswer === -1 ? 'Unanswered' : String.fromCharCode(65 + effective.userAnswer)}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation</label>
                      <textarea
                        value={effective.explanation || ''}
                        onChange={e => handleQuestionEdit(correction.questionId, 'explanation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        rows={2}
                      />
                    </div>

                    {/* Topic/Subject tags */}
                    <div className="flex items-center gap-2 text-xs">
                      {correction.topic && (
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                          {correction.topic}
                        </span>
                      )}
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                        {correction.subject}
                      </span>
                    </div>

                    {/* Save button for edited questions */}
                    {isEdited && (
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => saveQuestionEdit(correction.questionId)}
                          disabled={saving === correction.questionId}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 text-sm"
                        >
                          <Save className="w-4 h-4" />
                          {saving === correction.questionId ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => router.push('/admin/results')}
          className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Back to Results
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Edit questions and click <strong>Recalculate</strong> to update the score
        </div>
      </div>
    </div>
  );
}
