'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import api from '@/lib/api';

interface WalletItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  reference?: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    portalId: string;
  };
}

interface MonthlyStat {
  month: string;
  year: number;
  total: number;
  count: number;
  items: WalletItem[];
}

export default function AdminWalletPage() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [items, setItems] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'monthly' | 'items'>('monthly');

  useEffect(() => {
    fetchData();
  }, [view]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      if (view === 'monthly') {
        const res = await api.getAdminWalletMonthly();
        setMonthlyStats(res.data || []);
      } else {
        const res = await api.getAdminWalletItems();
        setItems(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet records');
    } finally {
      setLoading(false);
    }
  }

  const totalAllTime = monthlyStats.reduce((sum, m) => sum + m.total, 0);
  const totalCount = monthlyStats.reduce((sum, m) => sum + m.count, 0);

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
        <h1 className="text-2xl font-bold text-gray-900">Wallet Records</h1>
        <p className="text-gray-600 mt-1">Payment records and monthly totals</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">₦{totalAllTime.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Months</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-2 rounded-lg font-medium ${view === 'monthly' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Monthly Summary
        </button>
        <button
          onClick={() => setView('items')}
          className={`px-4 py-2 rounded-lg font-medium ${view === 'items' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All Records
        </button>
      </div>

      {/* Monthly Summary View */}
      {view === 'monthly' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {monthlyStats.length === 0 ? (
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Month</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Transactions</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Total Amount</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.map((stat, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{stat.month}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{stat.count}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">₦{stat.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">₦{stat.count > 0 ? Math.round(stat.total / stat.count).toLocaleString() : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All Records View */}
      {view === 'items' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No wallet records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">User</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Reference</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.user?.fullName || item.user?.email || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.reference || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        ₦{((item.metadata as any)?.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
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
