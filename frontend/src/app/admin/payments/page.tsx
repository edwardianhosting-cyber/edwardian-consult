'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Search, Filter } from 'lucide-react';
import api from '@/lib/api';

interface Payment {
  id: string;
  userId: string;
  reference: string;
  amount: number;
  status: string;
  paymentMethod: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    portalId: string;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('SUCCESSFUL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, currentPage]);

  async function fetchPayments() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPaymentsAdmin(currentPage, 20, statusFilter);
      const data = res.data || {};
      setPayments(data.payments || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.user?.fullName?.toLowerCase().includes(query) ||
      payment.user?.email?.toLowerCase().includes(query) ||
      payment.reference?.toLowerCase().includes(query) ||
      payment.description?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

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
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">View all successful student payments</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">₦{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-2xl font-bold text-gray-900 capitalize">{statusFilter.toLowerCase()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, email, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Reference</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.user?.fullName || payment.user?.email || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{payment.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">₦{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
