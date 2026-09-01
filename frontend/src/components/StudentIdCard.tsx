'use client';

import { useEffect, useState } from 'react';
import { Download, RefreshCw, Shield } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface IdCardData {
  front: {
    schoolName: string;
    schoolShort: string;
    cardType: string;
    passportUrl: string | null;
    fullName: string;
    studentId: string;
    programme: string;
    classLevel: string;
    dateOfBirth: string;
    validUntil: string;
    qrCode: string;
  };
  back: {
    studentId: string;
    programme: string;
    department: string;
    session: string;
    registrationDate: string;
    phone: string;
    emergencyContact: string;
    verificationUrl: string;
  };
}

interface StudentIdCardProps {
  data?: IdCardData | null;
}

export default function StudentIdCard({ data: propData }: StudentIdCardProps) {
  const [idCard, setIdCard] = useState<IdCardData | null>(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (propData) {
      setIdCard(propData);
      return;
    }
    fetchIdCard();
  }, [propData]);

  async function fetchIdCard() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/idcard/id-card`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setIdCard(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ID card:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!idCard) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load ID card</p>
        <button
          onClick={fetchIdCard}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Student ID Card</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBack(!showBack)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {showBack ? 'Show Front' : 'Show Back'}
          </button>
          <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* ID Card */}
      <div className="perspective-1000">
        <div
          className={`relative transition-transform duration-700 transform-style-preserve-3d ${
            showBack ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 rounded-2xl p-6 text-white shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                    <span className="text-primary-900 font-bold text-lg">E</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{idCard.front.schoolName}</h3>
                    <p className="text-accent-400 text-xs">{idCard.front.schoolShort}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-accent-500 text-primary-900 text-xs font-bold px-3 py-1 rounded-full">
                  {idCard.front.cardType}
                </span>
              </div>
            </div>

            {/* Photo and Details */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-28 bg-white/20 rounded-lg overflow-hidden border-2 border-accent-400">
                  {idCard.front.passportUrl ? (
                    <img
                      src={idCard.front.passportUrl}
                      alt="Passport"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-accent-400 text-xs">FULL NAME</p>
                  <p className="font-bold text-lg">{idCard.front.fullName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-accent-400 text-xs">STUDENT ID</p>
                    <p className="font-semibold">{idCard.front.studentId}</p>
                  </div>
                  <div>
                    <p className="text-accent-400 text-xs">PROGRAMME</p>
                    <p className="font-semibold">{idCard.front.programme}</p>
                  </div>
                  <div>
                    <p className="text-accent-400 text-xs">CLASS/LEVEL</p>
                    <p className="font-semibold">{idCard.front.classLevel}</p>
                  </div>
                  <div>
                    <p className="text-accent-400 text-xs">DATE OF BIRTH</p>
                    <p className="font-semibold">{idCard.front.dateOfBirth}</p>
                  </div>
                </div>
                <div>
                  <p className="text-accent-400 text-xs">VALID UNTIL</p>
                  <p className="font-semibold">{idCard.front.validUntil}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
              <p className="text-xs text-white/70">Scan to verify identity</p>
              <div className="bg-white p-2 rounded-lg">
                <img src={idCard.front.qrCode} alt="QR Code" className="w-16 h-16" />
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white rounded-2xl p-6 shadow-2xl border-2 border-primary-200"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <Shield className="w-6 h-6 text-primary-600" />
                <h3 className="font-bold text-gray-900">Student Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-xs">Student ID</p>
                  <p className="font-semibold text-gray-900">{idCard.back.studentId}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Programme</p>
                  <p className="font-semibold text-gray-900">{idCard.back.programme}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Department/Category</p>
                  <p className="font-semibold text-gray-900">{idCard.back.department}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Session</p>
                  <p className="font-semibold text-gray-900">{idCard.back.session}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Registration Date</p>
                  <p className="font-semibold text-gray-900">{idCard.back.registrationDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone Number</p>
                  <p className="font-semibold text-gray-900">{idCard.back.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Emergency Contact</p>
                  <p className="font-semibold text-gray-900">{idCard.back.emergencyContact}</p>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ If found, please return this card to the school administration.
                  </p>
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <p className="text-primary-800 text-sm">
                    📱 Scan the QR code to verify this student&apos;s identity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Info */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800">ID Card Verified</p>
            <p className="text-green-600 text-sm">This ID card is valid and active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

