'use client';

import { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, Phone, ChevronDown, ChevronUp, BookOpen, Video, FileText } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const faqs: FAQ[] = [
    {
      question: 'How do I start practicing for JAMB?',
      answer:
        'Go to the CBT Practice section from the sidebar. Select your subject and start practicing with our comprehensive question bank.',
    },
    {
      question: 'How can I check my results?',
      answer:
        'Your results will appear in the Results section after completing any mock exam or CBT practice session.',
    },
    {
      question: 'How do I contact my tutor?',
      answer:
        'Use the Messages section to send messages to your tutors or administrators.',
    },
    {
      question: 'Can I download study materials?',
      answer:
        'Yes, visit the Study Materials section to access and download PDF notes and past questions.',
    },
    {
      question: 'How do I reset my password?',
      answer:
        'Go to Settings > Security tab to change your password. You will need to enter your current password first.',
    },
    {
      question: 'How can my parents track my progress?',
      answer:
        'Your parents can use the Parent Portal with the Portal ID and Access Code provided during registration.',
    },
  ];

  const resources = [
    { title: 'User Guide', icon: BookOpen, description: 'Complete guide to using the platform' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Get help with using the platform</p>
      </div>

      {/* Contact Options */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <a
          href="mailto:support@edwardianeducationalconsult.com.ng"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Email Us</h3>
          <p className="text-sm text-gray-500">support@edwardianeducationalconsult.com.ng</p>
        </a>
        <a
          href="https://wa.me/2348000000000"
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
        <a
          href="tel:+2348000000000"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Call Us</h3>
          <p className="text-sm text-gray-500">+234 800 000 0000</p>
        </a>
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
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
        <div className="grid sm:grid-cols-1 gap-4 max-w-sm">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <button
                key={index}
                onClick={() => setShowUserGuide(true)}
                className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 text-left"
              >
                <Icon className="w-8 h-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">{resource.title}</h3>
                <p className="text-sm text-gray-500">{resource.description}</p>
              </button>
            );
          })}
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
                <p>If you need additional assistance, contact us via email at support@edwardianeducationalconsult.com.ng or chat with us on WhatsApp.</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
