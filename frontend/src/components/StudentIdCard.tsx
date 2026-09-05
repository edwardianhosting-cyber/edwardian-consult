'use client';

import { useEffect, useState } from 'react';
import { Download, RefreshCw, Shield, Printer } from 'lucide-react';
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
    gender: string;
    state: string;
  };
  back: {
    studentId: string;
    fullName: string;
    programme: string;
    classLevel: string;
    targetCourse: string;
    targetInstitution: string;
    phone: string;
    email: string;
    address: string;
    state: string;
    lga: string;
    emergencyContact: string;
    registrationDate: string;
    validUntil: string;
    verificationUrl: string;
  };
  verification: {
    isValid: boolean;
    studentName: string;
    studentId: string;
    status: string;
    programme: string;
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

  function handleDownload() {
    window.print();
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
    <div className="max-w-md mx-auto">
      <div className="mb-4 flex items-center justify-between no-print">
        <h2 className="text-xl font-bold text-gray-900">Student ID Card</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBack(!showBack)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {showBack ? 'Show Front' : 'Show Back'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Download / Print
          </button>
        </div>
      </div>

      {/* ID Card */}
      <div className="perspective-1000">
        <div
          className="relative transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="bg-white rounded-xl border-2 border-[#8B5A2B] shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              width: '100%',
              minHeight: '340px',
            }}
          >
            {/* Header */}
            <div className="bg-[#8B5A2B] text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-8 h-8 object-contain bg-white rounded-full p-0.5"
                />
                <div>
                  <h3 className="font-bold text-xs leading-tight">{idCard.front.schoolName}</h3>
                  <p className="text-[9px] text-white/80 leading-tight">{idCard.front.schoolShort}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-white text-[#8B5A2B] text-[9px] font-bold px-2 py-0.5 rounded">
                  {idCard.front.cardType}
                </span>
              </div>
            </div>

            {/* Photo and Details */}
            <div className="p-3 flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden border border-[#8B5A2B]">
                  {idCard.front.passportUrl ? (
                    <img
                      src={idCard.front.passportUrl}
                      alt="Passport"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                      👤
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1">
                <div className="col-span-2">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Full Name</p>
                  <p className="font-bold text-xs text-gray-900 leading-tight">{idCard.front.fullName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Student ID</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.front.studentId}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Programme</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.front.programme}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Class/Level</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.front.classLevel}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Gender</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.front.gender}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">State</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.front.state}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Date of Birth</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.front.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Valid Until</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.front.validUntil}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="px-3 pb-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <p className="text-[9px] text-gray-500">Scan to verify identity</p>
              <div className="bg-white p-1 rounded border border-gray-200">
                <img src={idCard.front.qrCode} alt="QR Code" className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white rounded-xl border-2 border-[#8B5A2B] shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              width: '100%',
              minHeight: '340px',
            }}
          >
            <div className="h-full flex flex-col">
              <div className="bg-[#8B5A2B] text-white px-3 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <h3 className="font-bold text-xs">Student Information</h3>
              </div>

              <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-1 flex-1">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Student ID</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.studentId}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Full Name</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.fullName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Programme</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.programme}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Class/Level</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.classLevel}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Target Course</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.targetCourse}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Target Institution</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.targetInstitution}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.phone}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-[11px] text-gray-900 break-all">{idCard.back.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Address</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.address}, {idCard.back.state} {idCard.back.lga}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Emergency Contact</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Valid Until</p>
                  <p className="font-semibold text-[11px] text-gray-900">{idCard.back.validUntil}</p>
                </div>
              </div>

              <div className="px-3 pb-2 pt-2 border-t border-gray-100">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-yellow-800 text-[9px] font-medium">
                    ⚠️ If found, please return this card to the school administration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Info */}
      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800 text-sm">ID Card Verified</p>
            <p className="text-green-600 text-xs">This ID card is valid and active</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .perspective-1000,
          .perspective-1000 *,
          .perspective-1000 * * {
            visibility: visible !important;
          }
          .perspective-1000 {
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
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
