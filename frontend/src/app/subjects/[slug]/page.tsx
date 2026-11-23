'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';

export default function SubjectDetailPage({ params }: { params: { slug: string } }) {
  const title = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const jambPdf = `https://your-domain.com/syllabus/${params.slug}-jamb.pdf`;
  const waecPdf = `https://your-domain.com/syllabus/${params.slug}-waec.pdf`;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <FloatingNav />
      <AnimatedAcademicBackground />
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/subjects" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Subjects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>

        <div className="space-y-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">JAMB Syllabus</h2>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(jambPdf)}&embedded=true`}
              style={{ width: '100%', height: '600px' }}
              frameBorder={0} sandbox="allow-scripts allow-same-origin allow-forms"
              title={`${title} JAMB Syllabus`}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">WAEC Syllabus</h2>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(waecPdf)}&embedded=true`}
              style={{ width: '100%', height: '600px' }}
              frameBorder={0} sandbox="allow-scripts allow-same-origin allow-forms"
              title={`${title} WAEC Syllabus`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
