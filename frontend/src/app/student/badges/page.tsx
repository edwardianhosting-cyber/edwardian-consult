'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Target, Flame, Award, Lock } from 'lucide-react';
import api from '@/lib/api';

interface Badge {
  id: string;
  earnedAt: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    points: number;
  };
}

interface AvailableBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  portalId: string;
  cbtCount: number;
  accuracy: number;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [available, setAvailable] = useState<AvailableBadge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard'>('achievements');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [badgesData, leaderboardData, rankData] = await Promise.all([
        api.getMyBadges(),
        api.getLeaderboard(),
        api.getBadges(),
      ]);

      const badgesResult = badgesData as any;
      setBadges(badgesResult.data?.earned || []);
      setAvailable(badgesResult.data?.available || []);
      setTotalPoints(badgesResult.data?.totalPoints || 0);

      const leaderboardResult = leaderboardData as any;
      setLeaderboard(leaderboardResult.data || []);

      const rankResult = rankData as any;
      setUserRank(rankResult.data);
    } catch (err: any) {
      console.error('Failed to fetch badges:', err);
    } finally {
      setLoading(false);
    }
  }

  function getCategoryColor(category: string) {
    const colors: Record<string, string> = {
      CBT: 'bg-blue-100 text-blue-700 border-blue-200',
      SCORE: 'bg-green-100 text-green-700 border-green-200',
      STREAK: 'bg-orange-100 text-orange-700 border-orange-200',
      MILESTONE: 'bg-purple-100 text-purple-700 border-purple-200',
      COMPETITION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      CBT: 'Practice',
      SCORE: 'Performance',
      STREAK: 'Consistency',
      MILESTONE: 'Milestones',
      COMPETITION: 'Rankings',
    };
    return labels[category] || category;
  }

  const CATEGORIES = ['CBT', 'SCORE', 'STREAK', 'MILESTONE', 'COMPETITION'] as const;

  const earnedByCategory = badges.reduce((acc, badge) => {
    const cat = badge.badge.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const availableByCategory = available.reduce((acc, badge: AvailableBadge) => {
    const cat = badge.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(badge);
    return acc;
  }, {} as Record<string, AvailableBadge[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600 mt-1">Track your progress and earn rewards</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-xl">
          <Star className="w-5 h-5 text-primary-600" />
          <span className="font-bold text-primary-700">{totalPoints} XP</span>
        </div>
      </div>

      {userRank && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-200">Your Rank</p>
              <p className="text-4xl font-bold">#{userRank.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-200">Accuracy</p>
              <p className="text-2xl font-bold">{userRank.accuracy}%</p>
              <p className="text-primary-200 text-sm">{userRank.cbtCount} CBTs completed</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Achievements ({badges.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Medal className="w-4 h-4" />
          Leaderboard
        </button>
      </div>

      {activeTab === 'achievements' ? (
        <div className="space-y-8">
          {Object.keys(earnedByCategory).length === 0 && Object.keys(availableByCategory).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No achievements yet</p>
              <p className="text-gray-400 text-sm mt-1">Complete CBTs and activities to earn badges</p>
            </div>
          ) : (
            CATEGORIES.map((category) => {
              const label = getCategoryLabel(category);
              const earned = earnedByCategory[category] || [];
              const avail = availableByCategory[category] || [];
              if (earned.length === 0 && avail.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                      {label.charAt(0)}
                    </span>
                    {label}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {earned.map((badge) => (
                      <div
                        key={badge.id}
                        className={`bg-white rounded-xl border-2 p-4 text-center hover:shadow-lg transition-shadow ${getCategoryColor(badge.badge.category)}`}
                      >
                        <div className="text-4xl mb-2">{badge.badge.icon}</div>
                        <h3 className="font-semibold text-sm">{badge.badge.name}</h3>
                        <p className="text-xs mt-1 opacity-80">{badge.badge.description}</p>
                        <div className="mt-3 flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" />
                          <span className="text-xs font-bold">{badge.badge.points} XP</span>
                        </div>
                      </div>
                    ))}
                    {avail.map((badge: AvailableBadge) => (
                      <div
                        key={badge.id}
                        className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-4 text-center opacity-60"
                      >
                        <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                        <h3 className="font-semibold text-sm text-gray-600">{badge.name}</h3>
                        <p className="text-xs mt-1 text-gray-500">{badge.description}</p>
                        <div className="mt-3 flex items-center justify-center gap-1 text-gray-400">
                          <Lock className="w-3 h-3" />
                          <span className="text-xs font-bold">{badge.points} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
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
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`grid grid-cols-12 gap-4 p-4 items-center border-t border-gray-50 hover:bg-gray-50 ${
                userRank?.userId === entry.userId ? 'bg-primary-50' : ''
              }`}
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
