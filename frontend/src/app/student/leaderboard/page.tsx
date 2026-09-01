'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  portalId: string;
  examTypes: string[];
  cbtCount: number;
  accuracy: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userExamType, setUserExamType] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedExamType]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLeaderboard(selectedExamType || undefined);
      setEntries(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const examTypes = user.examTypes || [];
      if (examTypes.length > 0) {
        setUserExamType(examTypes[0]);
        setSelectedExamType(examTypes[0]);
      }
    }
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">Top performing students</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchLeaderboard}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Top performing students</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Exam Type</label>
        <select
          value={selectedExamType}
          onChange={(e) => setSelectedExamType(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Exams</option>
          <option value="JAMB">JAMB</option>
          <option value="WAEC">WAEC</option>
          <option value="NECO">NECO</option>
          <option value="POST-UTME">POST-UTME</option>
        </select>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No leaderboard data yet</p>
          <p className="text-gray-400 text-sm mt-1">Complete CBTs to appear on the leaderboard</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-semibold text-gray-600">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-2 text-center">CBTs</div>
            <div className="col-span-2 text-center">Accuracy</div>
            <div className="col-span-2 text-right">Points</div>
          </div>
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className="grid grid-cols-12 gap-4 p-4 items-center border-t border-gray-50 hover:bg-gray-50"
            >
              <div className="col-span-1">
                {entry.rank <= 3 ? (
                  <span className="text-xl">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="font-semibold text-gray-600">#{entry.rank}</span>
                )}
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">
                    {entry.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{entry.name}</p>
                  <p className="text-xs text-gray-500">{entry.portalId}</p>
                </div>
              </div>
              <div className="col-span-2 text-center text-sm text-gray-600">
                {entry.cbtCount}
              </div>
              <div className="col-span-2 text-center">
                <span className={`text-sm font-medium ${
                  entry.accuracy >= 70 ? 'text-green-600' : entry.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {entry.accuracy}%
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-bold text-primary-600">
                  {entry.accuracy * entry.cbtCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
