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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <FloatingNav />
      <AnimatedAcademicBackground />
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/subjects" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Subjects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">
          Syllabus and preparation materials for {title} will be available here.
        </p>
      </section>
    </div>
  );
}
