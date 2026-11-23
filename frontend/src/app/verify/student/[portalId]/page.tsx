'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { Shield, User, Calendar, MapPin, Phone, Mail, BookOpen, Award, CheckCircle, XCircle } from 'lucide-react';

interface VerificationData {
  isValid: boolean;
  studentName: string;
  studentId: string;
  status: string;
  programme: string;
  gender?: string;
  state?: string;
  classLevel?: string;
  dateOfBirth?: string;
  admissionYear?: string;
  phone?: string;
  email?: string;
  address?: string;
  targetCourse?: string;
  targetInstitution?: string;
  photo?: string | null;
  message?: string;
}

export default function VerifyStudentPage() {
  const params = useParams();
  const portalId = params.portalId as string;
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portalId) {
      fetchVerification();
    }
  }, [portalId]);

  async function fetchVerification() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/idcard/verify/${encodeURIComponent(portalId)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Verification failed');
      }
      const result = await res.json();
      setData(result.data || result);
    } catch (err: any) {
      setError(err.message || 'Failed to verify student');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Student ID Verification</h1>
          <p className="text-gray-600 mt-2">Edwardian Educational Consult</p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying student identity...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Verification Failed</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Student Identity Card</h2>
                <p className="text-primary-100 text-sm">Official Verification Record</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.isValid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {data.status}
              </div>
            </div>

            <div className="p-6">
              <div className="printable-area">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0">
                  {data.photo ? (
                    <img
                      src={data.photo}
                      alt={data.studentName}
                      className="w-32 h-40 object-cover rounded-lg border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-40 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900">{data.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</label>
                    <p className="text-sm font-medium text-gray-900 font-mono">{data.studentId}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</label>
                    <p className="text-sm font-medium text-gray-900">{data.programme}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</label>
                    <p className="text-sm text-gray-900">{data.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">State</label>
                    <p className="text-sm text-gray-900">{data.state || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Class Level</label>
                    <p className="text-sm text-gray-900">{data.classLevel || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</label>
                    <p className="text-sm text-gray-900">{data.dateOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Year</label>
                    <p className="text-sm text-gray-900">{data.admissionYear || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                    <p className="text-sm text-gray-900">{data.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                    <p className="text-sm text-gray-900 break-all">{data.email || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                    <p className="text-sm text-gray-900">{data.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Target Course</label>
                    <p className="text-sm text-gray-900">{data.targetCourse || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Target Institution</label>
                    <p className="text-sm text-gray-900">{data.targetInstitution || 'N/A'}</p>
                  </div>
                </div>
              </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {data.isValid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">This ID card is valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">This ID card is invalid or inactive</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Print / Save as PDF
                </button>
              </div>
            </div>

            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .printable-area,
                .printable-area *,
                .printable-area * * {
                  visibility: visible !important;
                }
                .printable-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  display: block !important;
                }
                .no-print {
                  display: none !important;
                }
                @page {
                  size: auto;
                  margin: 15mm;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
