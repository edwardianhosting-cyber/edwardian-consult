'use client';

import { useEffect, useState } from 'react';
import { Wallet, CreditCard, Download, Eye, FileText, Award, CheckCircle, Clock, Plus, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

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
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    try {
      setLoading(true);
      const [itemsRes, balanceRes] = await Promise.all([
        api.getWalletItems(),
        api.getWalletBalance(),
      ]);
      const itemsData = itemsRes as any;
      const balanceData = balanceRes as any;
      setItems(itemsData.data || []);
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
      alert('Deposit successful!');
    } catch (error: any) {
      alert(error.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  }

  const tabs = [
    { id: 'all', label: 'All', icon: Wallet },
    { id: 'ID_CARD', label: 'ID Cards', icon: CreditCard },
    { id: 'CERTIFICATE', label: 'Certificates', icon: Award },
    { id: 'RECEIPT', label: 'Receipts', icon: FileText },
    { id: 'RESULT', label: 'Results', icon: CheckCircle },
  ];

  const filteredItems = activeTab === 'all' ? items : items.filter((item) => item.type === activeTab);

  function getTypeIcon(type: string) {
    switch (type) {
      case 'ID_CARD':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'CERTIFICATE':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'RECEIPT':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'RESULT':
        return <CheckCircle className="w-5 h-5 text-yellow-600" />;
      case 'PAYMENT_RECORD':
        return <Wallet className="w-5 h-5 text-primary-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'ID_CARD':
        return 'ID Card';
      case 'CERTIFICATE':
        return 'Certificate';
      case 'RECEIPT':
        return 'Receipt';
      case 'RESULT':
        return 'Result';
      case 'PAYMENT_RECORD':
        return 'Payment';
      default:
        return type;
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-1">Manage your balance and view documents</p>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items in your wallet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your documents and certificates will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {getTypeLabel(item.type)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </a>
                    )}
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
