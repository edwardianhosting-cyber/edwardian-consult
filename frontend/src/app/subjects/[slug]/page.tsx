'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getSubjectPdfUrl } from '@/lib/subjectPdfs';
import { SUBJECT_PDFS } from '@/lib/subjectPdfs';
import { ArrowLeft } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';

const PdfViewer = dynamic(() => import('@/components/public/PdfViewer'), { ssr: false });

export default function SubjectDetailPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const src = getSubjectPdfUrl(slug);
  const availableJamb = new Set(['agriculture-science','arabic','art','biology','chemistry','christian-religious-studies','commerce','computer-studies','economics','french','geography','government','hausa','history','home-economics','igbo','islamic-studies','literature-in-english','mathematics','music','physical-and-health-education','physics','principles-of-accounts','use-of-english','yoruba']);
  const jambSrc = availableJamb.has(slug.toLowerCase()) ? `/api/jamb-syllabus/${encodeURIComponent(slug)}` : null;

  if (!src) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <FloatingNav />
        <AnimatedAcademicBackground />
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/subjects" className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Subjects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center py-20">
            <p className="text-gray-600">Syllabus not yet available for {title}.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <FloatingNav />
      <AnimatedAcademicBackground />
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
<h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="space-y-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">JAMB Syllabus</h2>
              <Link href="/subjects" className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Subjects
              </Link>
            </div>
            {jambSrc ? <PdfViewer src={jambSrc} /> : <p className="text-gray-600">Syllabus not yet available for {title}.</p>}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">WAEC Syllabus</h2>
            {src ? <PdfViewer src={src} /> : <p className="text-gray-600">Syllabus not yet available for {title}.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
