'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function VerificationPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{
    valid: boolean;
    data?: {
      studentName: string;
      program: string;
      grade?: string;
      issuedDate: string;
      expiryDate?: string;
    };
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verification/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, message: 'Verification service unavailable. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Certificate Verification</h1>
          <p className="text-xl text-primary-200 max-w-2xl mx-auto">
            Verify the authenticity of certificates and documents issued by Edwardian Educational Consult
          </p>
        </div>
      </section>

      {/* Verification Form */}
      <section className="py-12">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Enter Verification Code</h2>
            
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your verification code"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg tracking-wider"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Enter the verification code found on your certificate or document
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Certificate'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg border-2 ${
                result.valid 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {result.valid ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    result.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.valid ? 'Certificate Verified' : 'Verification Failed'}
                  </span>
                </div>

                {result.valid && result.data && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student Name:</span>
                      <span className="font-medium text-gray-900">{result.data.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Program:</span>
                      <span className="font-medium text-gray-900">{result.data.program}</span>
                    </div>
                    {result.data.grade && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grade:</span>
                        <span className="font-medium text-gray-900">{result.data.grade}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issued Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(result.data.issuedDate).toLocaleDateString()}
                      </span>
                    </div>
                    {result.data.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(result.data.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!result.valid && result.message && (
                  <p className="text-red-700 text-sm">{result.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Why Verify?</h3>
                <p className="text-sm text-blue-700">
                  Certificate verification helps employers, institutions, and other stakeholders confirm 
                  the authenticity of certificates issued by Edwardian Educational Consult. This ensures 
                  trust and credibility in our certification process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

