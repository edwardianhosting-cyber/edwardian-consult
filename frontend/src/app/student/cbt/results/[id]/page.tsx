'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, BookOpen } from 'lucide-react';

interface CBTResultDetail {
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
    difficulty?: string;
  }[];
}

export default function CBTResultDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<CBTResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchResult();
    }
  }, [id]);

  async function fetchResult() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCBTResult(id);
      if (res.data) {
        setData(res.data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Result Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The result you are looking for does not exist.'}</p>
          <Link href="/student/results" className="text-primary-600 hover:underline">
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/student/results"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{data.result.subject} Result</h1>
        <p className="text-gray-600 mt-1">
          {new Date(data.result.completedAt).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Score Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(data.result.score)}`}>
              {Math.round(data.result.score)}%
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold text-gray-900">{data.result.durationUsed} min</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{data.result.correctAnswers}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{data.result.wrongAnswers}</p>
            <p className="text-sm text-gray-500">Wrong</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600">{data.result.skippedAnswers}</p>
            <p className="text-sm text-gray-500">Skipped</p>
          </div>
        </div>
      </div>

      {/* Corrections */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-600" />
          Corrections
        </h2>
        <div className="space-y-4">
          {data.corrections.map((correction, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                correction.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {correction.isCorrect ? (
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
                    {correction.options.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={`text-sm p-2 rounded ${
                          optIndex === correction.correctOption
                            ? 'bg-green-100 text-green-800 font-medium'
                            : optIndex === correction.userAnswer && optIndex !== correction.correctOption
                            ? 'bg-red-100 text-red-800'
                            : 'text-gray-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === correction.correctOption && ' ✓'}
                        {optIndex === correction.userAnswer && optIndex !== correction.correctOption && ' ✗ (Your answer)'}
                      </div>
                    ))}
                  </div>
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
                    {correction.difficulty && (
                      <span className={`px-2 py-0.5 rounded ${
                        correction.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                        correction.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {correction.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
