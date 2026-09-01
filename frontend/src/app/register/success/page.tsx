'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, ArrowRight, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

function SuccessContent() {
  const [countdown, setCountdown] = useState(10);
  const [showSpamHelp, setShowSpamHelp] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been created. Your login details have been sent to your email address.
          </p>

          {/* Email Notification */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-left">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Check your email inbox</p>
                <p className="text-sm text-blue-700">
                  We sent your <strong>Portal ID</strong> and <strong>password</strong> to the email address you registered with.
                </p>
              </div>
            </div>
          </div>

          {/* Spam Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">Can&apos;t find the email?</p>
                <p className="text-sm text-amber-700">
                  Please check your <strong>Spam</strong> or <strong>Junk</strong> folder. Sometimes our welcome email is filtered automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Spam Help */}
          <button
            type="button"
            onClick={() => setShowSpamHelp(!showSpamHelp)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-all mb-4"
          >
            <span className="font-medium">How to find email in spam?</span>
            {showSpamHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSpamHelp && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-left text-sm text-gray-700 space-y-2">
              <p className="font-semibold text-gray-800 mb-2">Step-by-step:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex-shrink-0 mt-0.5">1</span>
                  <p>Open your email app (Gmail, Yahoo, etc.)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex-shrink-0 mt-0.5">2</span>
                  <p>Look for a folder called <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex-shrink-0 mt-0.5">3</span>
                  <p>Find the email from <strong>registrar@edwardianeducationalconsult.com.ng</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex-shrink-0 mt-0.5">4</span>
                  <p>Open it and copy your <strong>Portal ID</strong> and <strong>password</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex-shrink-0 mt-0.5">5</span>
                  <p>Mark the email as <strong>Not Spam</strong> so future emails reach your inbox</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 text-primary-900 font-bold rounded-xl hover:bg-accent-400 transition-all"
            >
              Proceed to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Countdown */}
          <p className="mt-4 text-sm text-gray-400">
            Redirecting to login in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
