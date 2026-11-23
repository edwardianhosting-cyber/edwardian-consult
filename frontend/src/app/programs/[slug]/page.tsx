'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

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
  isActive: boolean;
  order: number;
}

import { programApi } from '@/lib/api';

export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgram();
  }, [slug]);

  const fetchProgram = async () => {
    try {
      const res = await programApi.getBySlug(slug);
      if (res.data.success) {
        setProgram(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch program:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₦${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h1>
          <Link href="/programs" className="text-primary-600 hover:underline">
            View all programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold font-heading mb-6">{program.title}</h1>
            <p className="text-lg text-primary-200 leading-relaxed">{program.description}</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Get</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {program.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-gray-900">{formatPrice(program.price)}</span>
                  {program.duration && (
                    <p className="text-sm text-gray-500 mt-2">Duration: {program.duration}</p>
                  )}
                </div>
                <Link
                  href={program.price === 0 ? '/register' : `/register?program=${program.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-accent-500 text-primary-900 font-bold rounded-xl hover:bg-accent-400 transition-all text-lg"
                >
                  {program.price === 0 ? 'BECOME A STUDENT FREE' : 'ENROLL NOW'}
                </Link>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Join thousands of successful students
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
