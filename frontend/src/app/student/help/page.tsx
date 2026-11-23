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

const DEFAULT_WHATSAPP = '07055432059';
const DEFAULT_PHONE = '+234 813 717 4918';
const DEFAULT_EMAIL = 'support@edwardianeducationalconsult.com.ng';

const DEFAULT_FAQS: FAQ[] = [
  { question: 'How do I log in to my account?', answer: 'Use your registered email and password on the login screen. If you forgot your password, click "Forgot Password" to reset it.' },
  { question: 'How do I take a CBT practice test?', answer: 'Go to the CBT Practice section from your dashboard, select your subject, and start the test. You can review answers and explanations after submitting.' },
  { question: 'How do I view my results?', answer: 'Visit the Results section on your dashboard to see your CBT and mock exam scores, grades, and performance breakdown.' },
  { question: 'How do I get my digital ID card?', answer: 'Visit the ID Card section from your dashboard. Your digital student ID card is generated automatically once your profile is complete.' },
  { question: 'How do I update my profile picture?', answer: 'Go to My Profile, tap the camera icon on your profile picture circle, and upload a new photo.' },
  { question: 'How do I check my admission status?', answer: 'Check the Dashboard or Admission section for your application status and updates from institutions.' },
  { question: 'How do I contact support?', answer: 'You can email us, call +234 813 717 4918, or chat with us on WhatsApp at 07055432059.' },
  { question: 'How do I access study materials?', answer: 'Go to the Study Materials section to browse notes and resources organized by subject and topic.' },
  { question: 'How do I submit an assignment?', answer: 'Open the Assignments section, select the assignment, upload your work, and submit before the deadline.' },
  { question: 'How do I enable push notifications?', answer: 'Allow notifications when prompted, or go to Settings to manage your notification preferences.' },
  { question: 'What is my portal ID?', answer: 'Your portal ID is shown on your profile page and on your digital ID card. Use it to log in and verify your identity.' },
  { question: 'How do I reset my password?', answer: 'On the login screen, click "Forgot Password" and follow the instructions sent to your registered email.' },
  { question: 'Can I take mock exams?', answer: 'Yes. Go to the Mock Exams section to take timed mock tests and review your results with detailed explanations.' },
  { question: 'How do I check the timetable?', answer: 'Open the Timetable section to view your class schedule and exam timetable.' },
  { question: 'Is my data secure?', answer: 'Yes. All your personal and academic data is encrypted and stored securely on our servers.' },
];

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState<SupportSettings>({
    supportEmail: 'support@edwardianeducationalconsult.com.ng',
    supportPhone: '+234 800 000 0000',
    supportWhatsApp: '07055432059',
    supportFaqs: '[]',
  });
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
    fetchSupportSettings();
  }, []);

  async function fetchUser() {
    try {
      const data = await api.getProfile();
      const u = (data as any)?.data || data;
      setUser(u);
    } catch {
      // fallback to localStorage
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    }
  }

  async function fetchSupportSettings() {
    try {
      setLoading(true);
      setError(null);
      // Use the public endpoint that does not require admin permissions
      const data = await api.getPublicSupport();
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
        setFaqs(DEFAULT_FAQS);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load support settings');
      setFaqs(DEFAULT_FAQS);
    } finally {
      setLoading(false);
    }
  }

  const emailHref = support.supportEmail ? `mailto:${support.supportEmail}` : undefined;
  const whatsappHref = `https://wa.me/${(support.supportWhatsApp || '07055432059').replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello, I need assistance. My name is ${user?.fullName || 'a student'} (Portal ID: ${user?.portalId || 'N/A'}).`
  )}`;
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
                <h3 className="font-semibold text-gray-900 mb-2">1. Getting Started</h3>
                <p>Welcome to Edwardian Educational Consult! Register with your email, verify your account, and log in to access your student portal.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">2. Login & Your Profile</h3>
                <p>Log in with your registered email and password. Go to "My Profile" to view and update your personal details, upload your profile picture, and check your Portal ID.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">3. CBT Practice Tests</h3>
                <p>Go to "CBT Practice" from your dashboard, choose your registered subject, and start a timed practice test. Review your answers and explanations after submitting.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">4. Mock Exams</h3>
                <p>Take full-length mock exams under timed conditions to prepare for the real exam. View your mock results with a detailed performance breakdown.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">5. Results & Performance</h3>
                <p>Check your CBT and mock exam scores in the "Results" section. Use "Performance" to see your strengths, weaknesses, and overall averages.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">6. Study Materials</h3>
                <p>Access notes, past questions, and learning resources organized by subject and topic in the "Study Materials" section.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">7. Assignments</h3>
                <p>View your posted assignments, download instructions, upload your completed work, and submit before the deadline in the "Assignments" section.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">8. Digital ID Card</h3>
                <p>Your official digital Student ID Card is available in the "ID Card" section. Flip it to view the front and back. Keep it handy for verification.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">9. Timetable</h3>
                <p>View your class schedule and exam timetable in the "Timetable" section so you never miss a session.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">10. Payments & Wallet</h3>
                <p>Make payments for exams or services and track your transaction history in the "Payments" and "Wallet" sections.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">11. News & Notifications</h3>
                <p>Stay updated with school announcements in "News & Updates" and view your personal notifications in the "Notifications" section.</p>
              </section>
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">12. Contact Support</h3>
                <p>Need extra help? Reach us via WhatsApp at 07055432059, call +234 813 717 4918, or email {support.supportEmail || DEFAULT_EMAIL}. When messaging, include your Portal ID so we can assist you faster.</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}