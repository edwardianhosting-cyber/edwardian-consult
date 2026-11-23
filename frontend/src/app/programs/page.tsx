'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import { AboutHeroCarousel } from '@/components/public/AboutImageCarousels';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import TypewriterText from '@/components/public/TypewriterText';

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  icon: string;
  imageUrl: string;
  price: number;
  duration: string;
}

import { programApi } from '@/lib/api';

const defaultPrograms: Program[] = [
  {
    id: '1',
    title: 'JAMB/UTME Preparation',
    slug: 'jamb-utme',
    description: 'Comprehensive tutoring and preparation for the Unified Tertiary Matriculation Examination.',
    features: [
      'Subject-by-subject practice',
      'Timed mock examinations',
      'Score prediction',
      'Admission guidance',
      'Study materials',
      'Video tutorials',
    ],
imageUrl: '/images/programs/jamb.webp',
    duration: 'Available Now',
  },
  {
    id: '3',
    title: 'Post-UTME Training',
    slug: 'post-utme',
    description: 'Specialized training for university-specific post-UTME screenings including UI, OAU, UNILAG, and more.',
    features: [
      'University-specific questions',
      'Past questions database',
      'Mock screening tests',
      'Interview preparation',
      'Admission counseling',
      'Success strategies',
    ],
imageUrl: '/images/programs/postutme.webp',
    duration: 'Available Now',
  },
  {
    id: '4',
    title: 'WAEC Preparation',
    slug: 'waec',
    description: 'Complete preparation for WAEC examinations with past questions and detailed explanations.',
    features: [
      'All WAEC subjects',
      'Theory and objectives practice',
      'Marked essays samples',
      'Exam tips and strategies',
      'Performance analytics',
      'Certificate verification',
    ],
    icon: 'FileCheck',
    imageUrl: '/images/programs/waec.webp',
    price: 12000,
    duration: 'Available Now',
  },
  {
    id: '5',
    title: 'NECO Preparation',
    slug: 'neco',
    description: 'Complete preparation for NECO examinations with past questions and detailed explanations.',
    features: [
      'All NECO subjects',
      'Theory and objectives practice',
      'Marked essays samples',
      'Exam tips and strategies',
      'Performance analytics',
      'Certificate verification',
    ],
    icon: 'FileCheck',
    imageUrl: '/images/programs/neco.webp',
    price: 12000,
    duration: 'Available Now',
  },
  {
    id: '5',
    title: 'JUPEB/IJMB A-Levels',
    slug: 'jupeb-ijmb',
    description: 'Direct entry preparation programs for students seeking admission into 200 level.',
    features: [
      'All JUPEB subjects',
      'IJMB curriculum coverage',
      'Practical sessions',
      'Assignment grading',
      'Lecture notes',
      'Mock examinations',
    ],
    icon: 'Library',
    imageUrl: '/images/programs/alevels.webp',
    duration: 'Available Now',
  },
  {
    id: '6',
    title: 'Admission Counseling',
    slug: 'admission-counseling',
    description: 'Professional guidance on course selection, university choices, and admission strategies.',
    features: [
      'One-on-one counseling',
      'Course selection guidance',
      'University comparison',
      'Application assistance',
      'Scholarship information',
      'Career guidance',
    ],
    icon: 'Users',
    imageUrl: '/images/programs/counselling.webp',
    duration: 'Available Now',
  },
];

const iconMap: Record<string, any> = {
  GraduationCap: ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  ),
  BookOpen: ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Award: ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  FileCheck: ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Library: ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  ),
  Users: ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(defaultPrograms);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await programApi.getAll();
      if (res.success && res.data && res.data.length > 0) {
        setPrograms(res.data);
      }
    } catch (error) {
      console.log('Using default programs');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₦${price.toLocaleString()}`;
  };

  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = iconMap[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <FloatingNav />
      <AnimatedAcademicBackground />
      <section className="relative z-10">
        <AboutHeroCarousel />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/70 via-black/35 to-black/20 px-4 pt-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24">
            <Image
              src="/logo.png"
              alt="Edwardian Educational Consult logo"
              width={96}
              height={96}
              className="h-full w-full object-contain p-1"
              priority
            />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            <TypewriterText text="Our Programs" speed={120} className="text-white" />
          </h1>
          <p className="max-w-3xl text-base text-white/90 sm:text-xl">
            <TypewriterText text="Comprehensive preparation programs designed to help you excel in your examinations and secure admission." speed={90} className="text-white/90" />
          </p>
        </div>
      </section>
      <SubjectMarquee />
      {/* Programs Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {programs.map((program) => (
               <div
                 key={program.id}
                 className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
               >
                  {/* Image */}
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    <Image
                      src={program.imageUrl || `/images/programs/${program.slug}.jpg`}
                      alt={program.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                      {renderIcon(program.icon, 'h-7 w-7 text-primary-600 group-hover:text-white')}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        {program.duration && (
                          <p className="text-xs text-gray-500">{program.duration}</p>
                        )}
                      </div>
                      <Link
                        href={program.slug === 'admission-counseling'
                          ? 'https://wa.me/2348137174918?text=Hello%2C%20I%20would%20like%20to%20ask%20for%20guidance.%20My%20question%20is%3A%20%5Bfill%20in%20your%20question%20here%5D'
                          : `/register?program=${program.slug}`}
                        target={program.slug === 'admission-counseling' ? '_blank' : undefined}
                        rel={program.slug === 'admission-counseling' ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400 transition-all text-sm"
                      >
                        {program.slug === 'admission-counseling' ? 'Contact' : 'Enroll Now'}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-primary-800 overflow-hidden">
          <AnimatedAcademicBackground />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            Join thousands of successful students who have achieved their academic dreams with us.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400 transition-all shadow-lg text-lg"
          >
            BECOME A STUDENT FREE
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}



