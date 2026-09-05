'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import api from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  user?: {
    fullName: string;
    email: string;
    portalId: string;
  };
  correctAnswers: number;
  totalQuestions: number;
  examsTaken: number;
}

const EXAM_TYPES = [
  { value: 'JAMB', label: 'JAMB' },
  { value: 'WAEC', label: 'WAEC' },
  { value: 'NECO', label: 'NECO' },
  { value: 'MOCK', label: 'Mock Exams' },
  { value: 'PRACTICE', label: 'Practice CBT' },
];

export default function AdminLeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  async function fetchLeaderboards() {
    try {
      setLoading(true);
      const results: Record<string, LeaderboardEntry[]> = {};

      for (const examType of EXAM_TYPES) {
        try {
          const res = await api.getLeaderboard(20, examType.value);
          results[examType.value] = res.data || [];
        } catch (err) {
          console.error(`Failed to fetch ${examType.value} leaderboard:`, err);
          results[examType.value] = [];
        }
      }

      setLeaderboards(results);
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err);
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Top performers across all exam types</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-4 py-2 rounded-lg font-medium ${selectedType === 'ALL' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Types
          </button>
          {EXAM_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg font-medium ${selectedType === type.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Sections */}
      {selectedType === 'ALL' ? (
        <div className="space-y-8">
          {EXAM_TYPES.map((examType) => {
            const entries = leaderboards[examType.value] || [];
            if (entries.length === 0) return null;

            return (
              <div key={examType.value} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">{examType.label} Leaderboard</h2>
                  <p className="text-sm text-gray-500">Top {entries.length} performers</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Rank</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Portal ID</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Correct</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Total Qs</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Exams</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.userId} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getRankIcon(entry.rank)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {entry.user?.fullName || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{entry.user?.portalId || '-'}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">{entry.correctAnswers}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{entry.totalQuestions}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{entry.examsTaken}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              {EXAM_TYPES.find(t => t.value === selectedType)?.label} Leaderboard
            </h2>
          </div>
          {(leaderboards[selectedType] || []).length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No results yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Rank</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Portal ID</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Correct</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Total Qs</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Exams</th>
                  </tr>
                </thead>
                <tbody>
                  {(leaderboards[selectedType] || []).map((entry) => (
                    <tr key={entry.userId} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {entry.user?.fullName || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{entry.user?.portalId || '-'}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{entry.correctAnswers}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{entry.totalQuestions}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{entry.examsTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
