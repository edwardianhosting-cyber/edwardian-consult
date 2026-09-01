'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StudentIdCard from '@/components/StudentIdCard';

export default function IdCardPage() {
  const [idCard, setIdCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIDCard();
  }, []);

  async function fetchIDCard() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIDCard();
      setIdCard(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ID card');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !idCard) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student ID Card</h1>
          <p className="text-gray-600 mt-1">Your digital student identification card</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-red-500 text-lg">{error || 'No ID card data available'}</p>
          <button
            onClick={fetchIDCard}
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
        <h1 className="text-2xl font-bold text-gray-900">Student ID Card</h1>
        <p className="text-gray-600 mt-1">Your digital student identification card</p>
      </div>
      <StudentIdCard data={idCard} />
    </div>
  );
}
