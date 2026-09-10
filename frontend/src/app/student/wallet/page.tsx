'use client';

import { useEffect, useState } from 'react';
import { Wallet, CreditCard, Plus, ArrowDownRight, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

interface WalletItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  fileUrl?: string;
  reference?: string;
  createdAt: string;
}

interface WalletBalance {
  balance: number;
  currency: string;
}

export default function WalletPage() {
  const [items, setItems] = useState<WalletItem[]>([]);
  const [balance, setBalance] = useState<WalletBalance>({ balance: 0, currency: 'NGN' });
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    try {
      setLoading(true);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      const [itemsRes, balanceRes] = await Promise.all([
        Promise.race([api.getWalletItems(), timeoutPromise]),
        Promise.race([api.getWalletBalance(), timeoutPromise]),
      ]);
      const itemsData = itemsRes as any;
      const balanceData = balanceRes as any;
      setItems(Array.isArray(itemsData.data) ? itemsData.data : []);
      setBalance(balanceData.data || { balance: 0, currency: 'NGN' });
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit() {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    setDepositing(true);
    try {
      const reference = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const result = await api.depositToWallet(amount, reference);
      const data = result as any;
      setBalance(data.data);
      setShowDepositModal(false);
      setDepositAmount('');
      showSuccess('Deposit successful!');
    } catch (error: any) {
      showError(error.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-1">Manage your balance and view history</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm">Available Balance</p>
            <p className="text-3xl font-bold mt-1">₦{balance.balance.toLocaleString()}</p>
            <p className="text-primary-200 text-sm mt-1">{balance.currency}</p>
          </div>
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Deposit
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No history yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Deposit Funds</h2>
              <button
                onClick={() => { setShowDepositModal(false); setDepositAmount(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {[1000, 5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDepositAmount(preset.toString())}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                  >
                    ₦{preset.toLocaleString()}
                  </button>
                ))}
              </div>
              <button
                onClick={handleDeposit}
                disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {depositing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    Deposit ₦{depositAmount ? parseFloat(depositAmount).toLocaleString() : '0'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
