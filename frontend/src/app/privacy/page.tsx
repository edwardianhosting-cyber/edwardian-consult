import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-primary-200">Last updated: August 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
            <p className="text-gray-600">
              Edwardian Educational Consult (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our website and services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            <p className="text-gray-600">
              We may collect personal information that you voluntarily provide when registering for our services, 
              including:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Full name and contact information</li>
              <li>Email address and phone number</li>
              <li>Date of birth and gender</li>
              <li>Educational background and academic records</li>
              <li>Payment information</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">Automatically Collected Information</h3>
            <p className="text-gray-600">
              When you access our website, we may automatically collect information about your device and usage, 
              including:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">3. How We Use Your Information</h2>
            <p className="text-gray-600">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Provide and maintain our educational services</li>
              <li>Process transactions and send related information</li>
              <li>Send you notifications and updates</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">4. Information Sharing</h2>
            <p className="text-gray-600">
              We do not sell, trade, or otherwise transfer your personal information to third parties without 
              your consent, except as described in this policy. We may share information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Service providers who assist in operating our platform</li>
              <li>Educational institutions for admission purposes</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">5. Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information. However, no method 
              of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">6. Your Rights</h2>
            <p className="text-gray-600">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">7. Cookies</h2>
            <p className="text-gray-600">
              We use cookies to enhance your experience on our website. You can set your browser to refuse 
              cookies, but some features of our website may not function properly.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">8. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new policy on this page.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">9. Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: privacy@edwardianeducationalconsult.com.ng<br />
              Phone: +234 XXX XXX XXXX
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
