'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Award, CheckCircle, XCircle, BookOpen } from 'lucide-react';

interface MockResultData {
  result: {
    id: string;
    subject: string;
    type: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    skippedAnswers: number;
    durationUsed: number;
    completedAt: string;
    weakTopics: Record<string, { correct: number; total: number }>;
  };
  corrections: {
    questionNumber: number;
    question: string;
    options: string[];
    correctOption: number;
    userAnswer: number;
    isCorrect: boolean;
    explanation?: string;
    topic?: string;
    subject: string;
  }[];
}

interface SubjectStats {
  subject: string;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
}

export default function MockResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<MockResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  function getScoreColor(score: number) {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }

  function getSubjectStats(): SubjectStats[] {
    if (!result?.corrections) return [];

    const stats: Record<string, SubjectStats> = {};

    result.corrections.forEach(correction => {
      const subject = correction.subject || result.result.subject;
      if (!stats[subject]) {
        stats[subject] = {
          subject,
          total: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          score: 0,
        };
      }

      stats[subject].total++;
      if (correction.userAnswer === -1) {
        stats[subject].skipped++;
      } else if (correction.isCorrect) {
        stats[subject].correct++;
      } else {
        stats[subject].wrong++;
      }
    });

    return Object.values(stats).map(s => ({
      ...s,
      score: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }));
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
          <p className="text-gray-600 mt-1">View your mock examination result</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
          <p className="text-gray-600 mt-1">View your mock examination result</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Result not found</p>
          <Link
            href="/student/mock-results"
            className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            View Mock Results
          </Link>
        </div>
      </div>
    );
  }

  const subjectStats = getSubjectStats();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mock Exam Result</h1>
        <p className="text-gray-600 mt-1">View your mock examination result</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-6">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
          result.result.score >= 70 ? 'bg-green-100' : result.result.score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          <span className={`text-4xl font-bold ${
            result.result.score >= 70 ? 'text-green-600' : result.result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {Math.round(result.result.score)}%
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mock Exam Complete!</h2>
        <p className="text-gray-600 mb-6">{result.result.subject}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-xl p-4">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{result.result.correctAnswers}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{result.result.wrongAnswers}</p>
            <p className="text-sm text-gray-500">Wrong</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-600">{result.result.skippedAnswers}</p>
            <p className="text-sm text-gray-500">Skipped</p>
          </div>
        </div>

        {subjectStats.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectStats.map(stat => (
                <div key={stat.subject} className="bg-gray-50 rounded-xl p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stat.subject}</h4>
                    <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(stat.score)}`}>
                      {stat.score}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{stat.correct}/{stat.total} correct</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Print Result
          </button>
          <Link
            href="/student/mock-results"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            View All Mock Results
          </Link>
        </div>
      </div>

      {/* Corrections */}
      {result.corrections && result.corrections.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Corrections</h3>
          <div className="space-y-4">
            {result.corrections.map((correction, index) => {
              const isCorrect = correction.isCorrect;
              const isUnanswered = correction.userAnswer === -1;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
