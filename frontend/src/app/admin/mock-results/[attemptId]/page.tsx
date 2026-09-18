'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { ArrowLeft, Mail, Printer, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Correction {
  questionNumber: number;
  question: string;
  options: string[];
  correctOption: number;
  userAnswer: number;
  isCorrect: boolean;
  explanation?: string;
  topic?: string;
  subject: string;
}

interface MockResultDetail {
  id: string;
  studentName: string;
  email: string;
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

  const [result, setResult] = useState<MockResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  async function fetchResult() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCBTResult(attemptId);
      if ((res as any).data) {
        setResult((res as any).data);
      } else {
        setError('Result not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch result');
    } finally {
      setLoading(false);
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
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
          <h1 className="text-2xl font-bold text-gray-900">Mock Exam Result</h1>
          <p className="text-gray-600 mt-1">View mock examination result</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-red-500 text-lg">{error}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Mock Exam Result</h1>
          <p className="text-gray-600 mt-1">View mock examination result</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">Result not found</p>
        </div>
      </div>
    );
  }

  const corrections = result.corrections || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mock Exam Result</h1>
            <p className="text-gray-600 mt-1">{result.examTitle}</p>
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
                Send Result to Student
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Result
          </button>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Student Name</p>
            <p className="font-medium text-gray-900">{result.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{result.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mock Exam</p>
            <p className="font-medium text-gray-900">{result.examTitle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date Submitted</p>
            <p className="font-medium text-gray-900">{new Date(result.completedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Result Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Result Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-xl p-4">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
            <p className="text-sm text-gray-500">Wrong</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <AlertTriangle className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600">{result.skippedAnswers}</p>
            <p className="text-sm text-gray-500">Unanswered</p>
          </div>
          <div className={`rounded-xl p-4 ${getScoreColor(result.aggregate)}`}>
            <p className="text-2xl font-bold">{Math.round(result.score)}%</p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      {result.subjectEntries && result.subjectEntries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Breakdown</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.subjectEntries.map((entry) => (
              <div key={entry.subject} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{entry.subject}</h3>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(entry.score)}`}>
                    {entry.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">{entry.correct} / {entry.total} correct</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrections */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h2>
        <div className="space-y-4">
          {corrections.map((correction, index) => {
            const isCorrect = correction.isCorrect;
            const isUnanswered = correction.userAnswer === -1;

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      Q{correction.questionNumber}: {correction.question}
                    </p>
                    <div className="space-y-1 mb-2">
                      {correction.options.map((option: string, optIndex: number) => {
                        const isCorrectOption = optIndex === correction.correctOption;
                        const isUserAnswer = optIndex === correction.userAnswer;
                        const isWrongUserAnswer = isUserAnswer && !isCorrectOption;

                        let className = 'text-sm p-2 rounded ';
                        if (isCorrectOption) {
                          className += 'bg-green-100 text-green-800 font-medium';
                        } else if (isWrongUserAnswer) {
                          className += 'bg-red-100 text-red-800';
                        } else {
                          className += 'text-gray-600';
                        }

                        let label = '';
                        if (isCorrectOption && isCorrect) {
                          label = ' ✓ YOUR ANSWER - CORRECT ANSWER';
                        } else if (isCorrectOption && !isCorrect && !isUnanswered) {
                          label = ' ✓ CORRECT ANSWER';
                        } else if (isCorrectOption && isUnanswered) {
                          label = ' ✓ CORRECT ANSWER';
                        } else if (isWrongUserAnswer) {
                          label = ' ✗ YOUR ANSWER';
                        }

                        return (
                          <div key={optIndex} className={className}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {label && <span className="ml-2 font-bold">{label}</span>}
                          </div>
                        );
                      })}
                    </div>
                    {isUnanswered && (
                      <div className="mt-2 text-sm text-gray-500 italic">Not answered</div>
                    )}
                    {correction.explanation && (
                      <div className="mt-2 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Explanation:</strong> {correction.explanation}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      {correction.topic && (
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {correction.topic}
                        </span>
                      )}
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                        {correction.subject}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
