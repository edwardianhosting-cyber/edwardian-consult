import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-primary-200">Last updated: August 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using Edwardian Educational Consult&apos;s website and services, you agree to be bound 
              by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">2. Description of Services</h2>
            <p className="text-gray-600">
              Edwardian Educational Consult provides educational preparation services including:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>JAMB UTME preparation and practice</li>
              <li>WAEC/NECO preparation</li>
              <li>Post-UTME training</li>
              <li>JUPEB/IJMB programs</li>
              <li>Admission counseling</li>
              <li>Study materials and resources</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">3. User Accounts</h2>
            <p className="text-gray-600">
              When you create an account with us, you must provide accurate and complete information. You are 
              responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of unauthorized access</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">4. Registration and Payment</h2>
            <p className="text-gray-600">
              Registration for our programs may require payment of fees. By registering, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Pay all applicable fees as described at the time of registration</li>
              <li>Provide accurate payment information</li>
              <li>Comply with our refund policy</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">5. Intellectual Property</h2>
            <p className="text-gray-600">
              All content on our website, including text, graphics, logos, and software, is the property of 
              Edwardian Educational Consult and is protected by intellectual property laws. You may not:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Reproduce, distribute, or create derivative works without permission</li>
              <li>Use our content for commercial purposes without authorization</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">6. Acceptable Use</h2>
            <p className="text-gray-600">You agree not to use our services to:</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of our services</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">7. Limitation of Liability</h2>
            <p className="text-gray-600">
              Edwardian Educational Consult shall not be liable for any indirect, incidental, special, or 
              consequential damages arising from your use of our services. Our total liability shall not 
              exceed the amount paid by you for the specific service in question.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">8. Disclaimer of Warranties</h2>
            <p className="text-gray-600">
              Our services are provided &quot;as is&quot; without warranties of any kind, either express or implied. 
              We do not guarantee specific academic outcomes or results from using our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">9. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to terminate or suspend your account at any time for violations of these 
              terms or for any other reason at our sole discretion.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">10. Governing Law</h2>
            <p className="text-gray-600">
              These terms shall be governed by and construed in accordance with the laws of the Federal 
              Republic of Nigeria.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">11. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting on our website. Your continued use of our services constitutes acceptance of the 
              modified terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">12. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: legal@edwardianeducationalconsult.com.ng<br />
              Phone: +234 XXX XXX XXXX
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
