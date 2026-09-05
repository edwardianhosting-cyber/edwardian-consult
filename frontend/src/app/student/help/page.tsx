'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, MessageCircle, Mail, Phone, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import api from '@/lib/api';

interface FAQ {
  question: string;
  answer: string;
}

interface SupportSettings {
  supportEmail?: string;
  supportPhone?: string;
  supportWhatsApp?: string;
  supportFaqs?: string;
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState<SupportSettings>({
    supportEmail: 'support@edwardianeducationalconsult.com.ng',
    supportPhone: '+234 800 000 0000',
    supportWhatsApp: 'https://wa.me/2348000000000',
    supportFaqs: '[]',
  });
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetchSupportSettings();
  }, []);

  async function fetchSupportSettings() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSettings();
      const settings: SupportSettings = (data as any)?.data || {};
      setSupport(settings);
      try {
        const parsedFaqs = JSON.parse(settings.supportFaqs || '[]');
        if (Array.isArray(parsedFaqs)) {
          setFaqs(parsedFaqs);
        } else {
          setFaqs([]);
        }
      } catch {
        setFaqs([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load support settings');
    } finally {
      setLoading(false);
    }
  }

  const emailHref = support.supportEmail ? `mailto:${support.supportEmail}` : undefined;
  const whatsappHref = support.supportWhatsApp || 'https://wa.me/2348000000000';
  const phoneHref = support.supportPhone ? `tel:${support.supportPhone.replace(/\s/g, '')}` : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Get help with using the platform</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Contact Options */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {emailHref && (
          <a
            href={emailHref}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Email Us</h3>
            <p className="text-sm text-gray-500">{support.supportEmail}</p>
          </a>
        )}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">WhatsApp</h3>
          <p className="text-sm text-gray-500">Chat with us on WhatsApp</p>
        </a>
        {phoneHref && (
          <a
            href={phoneHref}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Call Us</h3>
            <p className="text-sm text-gray-500">{support.supportPhone}</p>
          </a>
        )}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-100 rounded-lg">
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {openFAQ === index && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-center text-gray-500 py-8">No FAQs available at the moment</p>
          )}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
        <div className="grid sm:grid-cols-1 gap-4 max-w-sm">
          <button
            onClick={() => setShowUserGuide(true)}
            className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 text-left"
          >
            <BookOpen className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">User Guide</h3>
            <p className="text-sm text-gray-500">Complete guide to using the platform</p>
          </button>
        </div>
      </div>

      {/* User Guide Modal */}
      {showUserGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">User Guide</h2>
              <button
                onClick={() => setShowUserGuide(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-gray-700">
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Getting Started</h3>
                <p>Welcome to Edwardian Educational Consult. This guide will help you navigate the platform and make the most of your learning experience.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
                <p>Your dashboard shows your progress, upcoming exams, recent results, and important notifications all in one place.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">CBT Practice</h3>
                <p>Go to the CBT Practice section to practice with past questions. Select a subject from your registered courses and start practicing.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Study Materials</h3>
                <p>Access study materials, notes, and resources organized by subject and topic to support your learning.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Assignments</h3>
                <p>View your assignments, submit completed work, and check your grades in the Assignments section.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Profile & Settings</h3>
                <p>Update your profile information, manage notification preferences, and change your password in Settings.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p>If you need additional assistance, contact us via email at {support.supportEmail || 'support@edwardianeducationalconsult.com.ng'} or chat with us on WhatsApp.</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}