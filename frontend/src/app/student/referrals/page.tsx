'use client';

import { useEffect, useState } from 'react';
import { Users, Copy, Gift, TrendingUp, CheckCircle, Lock } from 'lucide-react';
import api from '@/lib/api';

interface ReferralStats {
  totalReferrals: number;
  pending: number;
  registered: number;
  converted: number;
  rewardsGiven: number;
}

interface Referral {
  id: string;
  referredEmail: string;
  referralCode: string;
  status: string;
  createdAt: string;
  registeredAt?: string;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [applyCode, setApplyCode] = useState('');
  const [applyStatus, setApplyStatus] = useState<string | null>(null);
  const [codeLocked, setCodeLocked] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const code = user.portalId.slice(-8).toUpperCase();
      setReferralCode(code);
      setInviteMessage(`Join Edwardian Educational Consult! Use my referral code: ${code}`);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        const user = JSON.parse(userStr);
        const code = user.portalId.slice(-8).toUpperCase();
        setReferralCode(code);
        setInviteMessage(`Join Edwardian Educational Consult! Use my referral code: ${code}`);
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      const [statsRes, referralsRes] = await Promise.all([
        Promise.race([api.getReferralStats(), timeoutPromise]),
        Promise.race([api.getReferrals(), timeoutPromise]),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }

      if (referralsRes.data) {
        setReferrals(referralsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    try {
      await api.createReferral({ email });
      setEmail('');
      fetchData();
    } catch (error) {
      console.error('Failed to send referral:', error);
    }
  }

  async function applyReferralCode(e: React.FormEvent) {
    e.preventDefault();
    if (!applyCode || codeLocked) return;

    try {
      setApplyStatus('Applying...');
      const res = await api.applyReferralCode(applyCode);
      if (res.success) {
        setApplyStatus('Referral code applied successfully!');
        setCodeLocked(true);
        setApplyCode('');
      } else {
        setApplyStatus(res.message || 'Failed to apply referral code');
      }
    } catch (error: any) {
      setApplyStatus(error.message || 'Failed to apply referral code');
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-600 mt-1">Invite friends and earn rewards</p>
      </div>

      {/* Referral Code */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200">Your Referral Code</p>
            <p className="text-3xl font-bold mt-1 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{referralCode}</p>
            {codeLocked && (
              <p className="text-xs text-primary-200 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Code locked after use
              </p>
            )}
          </div>
          {!codeLocked && (
            <button
              onClick={copyCode}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          )}
        </div>
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm text-primary-100">{inviteMessage}</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
            <p className="text-sm text-gray-500">Total Referrals</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.registered}</p>
            <p className="text-sm text-gray-500">Registered</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.converted}</p>
            <p className="text-sm text-gray-500">Converted</p>
          </div>
        </div>
      )}

      {/* Send Referral */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite a Friend</h2>
        <form onSubmit={sendReferral} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter friend's email"
            required
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Send Invite
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          An invitation email with your referral code will be sent automatically.
        </p>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referrals</h2>
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No referrals yet</p>
            <p className="text-gray-400 text-sm">Invite friends using your code</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">
                      {referral.referredEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referral.referredEmail}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  referral.status === 'CONVERTED' ? 'bg-green-100 text-green-700' :
                  referral.status === 'REGISTERED' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {referral.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

