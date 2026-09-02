'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { API_BASE } from '@/lib/api';
import { FileCheck, Download, RefreshCw } from 'lucide-react';

interface TranscriptData {
  studentInfo: {
    name: string;
    studentId: string;
    programme: string;
    classLevel: string;
    dateOfBirth: string;
    currentSchool: string;
  };
  academicSession: string;
  subjects: {
    subject: string;
    averageScore: number;
    grade: string;
    attempts: number;
    totalQuestions: number;
    correctAnswers: number;
  }[];
  overallAverage: number;
  overallGrade: string;
  totalCBTs: number;
  totalPayments: number;
  generatedAt: string;
}

export default function TranscriptPage() {
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTranscripts();
  }, []);

  async function fetchTranscripts() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTranscript();
      setTranscript(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transcript');
    } finally {
      setLoading(false);
    }
  }

  async function generateTranscript() {
    try {
      setGenerating(true);
      const data = await api.generateTranscript();
      if (data.data) {
        setTranscript(data.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate transcript');
    } finally {
      setGenerating(false);
    }
  }

  function getGradeColor(grade: string) {
    const colors: Record<string, string> = {
      A: 'bg-green-100 text-green-700',
      B: 'bg-blue-100 text-blue-700',
      C: 'bg-yellow-100 text-yellow-700',
      D: 'bg-orange-100 text-orange-700',
      E: 'bg-red-100 text-red-700',
      F: 'bg-red-200 text-red-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-700';
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Transcript</h1>
            <p className="text-gray-600 mt-1">Your complete academic record</p>
          </div>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchTranscripts}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Transcript</h1>
          <p className="text-gray-600 mt-1">Your complete academic record</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateTranscript}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate New'}
          </button>
          {transcript && (
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>
      </div>

      {!transcript ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No transcript generated yet</p>
          <p className="text-gray-400 text-sm mt-1">Generate your transcript to view your academic record</p>
          <button
            onClick={generateTranscript}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Generate Transcript
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Academic Transcript</h2>
                <p className="text-primary-200">Session: {transcript.academicSession}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-200">Overall Grade</p>
                <span className={`text-3xl font-bold px-4 py-1 rounded-lg ${getGradeColor(transcript.overallGrade)}`}>
                  {transcript.overallGrade}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{transcript.studentInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Student ID</p>
                <p className="font-medium text-gray-900">{transcript.studentInfo.studentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Programme</p>
                <p className="font-medium text-gray-900">{transcript.studentInfo.programme}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Class/Level</p>
                <p className="font-medium text-gray-900">{transcript.studentInfo.classLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-900">{transcript.studentInfo.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current School</p>
                <p className="font-medium text-gray-900">{transcript.studentInfo.currentSchool}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Subject Performance</h3>
            {transcript.subjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No CBT results recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Subject</th>
                      <th className="pb-3 font-medium text-center">Attempts</th>
                      <th className="pb-3 font-medium text-center">Questions</th>
                      <th className="pb-3 font-medium text-center">Correct</th>
                      <th className="pb-3 font-medium text-center">Average</th>
                      <th className="pb-3 font-medium text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcript.subjects.map((subject, index) => (
                      <tr key={index} className="border-b border-gray-50">
                        <td className="py-3 font-medium text-gray-900">{subject.subject}</td>
                        <td className="py-3 text-center text-gray-600">{subject.attempts}</td>
                        <td className="py-3 text-center text-gray-600">{subject.totalQuestions}</td>
                        <td className="py-3 text-center text-gray-600">{subject.correctAnswers}</td>
                        <td className="py-3 text-center">
                          <span className={`font-medium ${
                            subject.averageScore >= 70 ? 'text-green-600' : 
                            subject.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {subject.averageScore}%
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(subject.grade)}`}>
                            {subject.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{transcript.totalCBTs}</p>
                <p className="text-xs text-gray-500">Total CBTs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{transcript.overallAverage}%</p>
                <p className="text-xs text-gray-500">Overall Average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{transcript.subjects.length}</p>
                <p className="text-xs text-gray-500">Subjects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{transcript.totalPayments}</p>
                <p className="text-xs text-gray-500">Payments</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

