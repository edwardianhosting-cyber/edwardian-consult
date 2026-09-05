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

interface UserRank {
  rank: number;
  accuracy: number;
  cbtCount: number;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [available, setAvailable] = useState<AvailableBadge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [badgesData, rankData] = await Promise.all([
        api.getMyBadges(),
        api.getMyRank(),
      ]);

      const badgesResult = badgesData as any;
      setBadges(badgesResult.data?.earned || []);
      setAvailable(badgesResult.data?.available || []);
      setTotalPoints(badgesResult.data?.totalPoints || 0);

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
      RANK: 'bg-pink-100 text-pink-700 border-pink-200',
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
      RANK: 'Position',
    };
    return labels[category] || category;
  }

  const CATEGORIES = ['CBT', 'SCORE', 'STREAK', 'MILESTONE', 'COMPETITION', 'RANK'] as const;

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

      <div className="space-y-8">
        {Object.keys(earnedByCategory).length === 0 && Object.keys(availableByCategory).length === 0 && !userRank ? (
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

            if (category === 'RANK') {
              if (!userRank) return null;
              const rankBadges = [
                {
                  id: 'rank-1',
                  badge: {
                    id: 'rank-1',
                    name: `#${userRank.rank} Position`,
                    description: `Ranked #${userRank.rank} on the leaderboard with ${userRank.accuracy}% accuracy`,
                    icon: userRank.rank === 1 ? '🥇' : userRank.rank === 2 ? '🥈' : userRank.rank === 3 ? '🥉' : '🏅',
                    category: 'RANK',
                    points: userRank.rank === 1 ? 500 : userRank.rank === 2 ? 300 : userRank.rank === 3 ? 200 : 100,
                  },
                } as Badge,
              ];
              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                      {label.charAt(0)}
                    </span>
                    {label}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {rankBadges.map((badge) => (
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
                  </div>
                </div>
              );
            }

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
    </div>
  );
}
