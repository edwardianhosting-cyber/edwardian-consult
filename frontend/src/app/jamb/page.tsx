import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, GraduationCap, Award, Clock, Users, Shield } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import { AboutHeroCarousel } from '@/components/public/AboutImageCarousels';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import TypewriterText from '@/components/public/TypewriterText';

const jambFeatures = [
  {
    title: 'CBT Practice Tests',
    icon: BookOpen,
    description: 'Realistic computer-based testing environment that mimics the actual JAMB UTME exam.',
  },
  {
    title: 'Past Questions Database',
    icon: GraduationCap,
    description: 'Access to years of JAMB past questions with detailed explanations and answers.',
  },
  {
    title: 'Mock Examinations',
    icon: Award,
    description: 'Timed mock exams to assess your readiness and predict your JAMB score.',
  },
  {
    title: 'Subject Coverage',
    icon: Users,
    description: 'All JAMB subjects covered: English, Mathematics, Physics, Chemistry, Biology, and more.',
  },
  {
    title: 'Performance Analytics',
    icon: Shield,
    description: 'Detailed score breakdowns and weak topic identification after every practice test.',
  },
  {
    title: '24/7 Access',
    icon: Clock,
    description: 'Study anytime, anywhere with our online JAMB preparation platform.',
  },
];

export default function JambPage() {
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
            <TypewriterText text="JAMB/UTME Preparation" speed={120} className="text-white" />
          </h1>
          <p className="max-w-3xl text-base text-white/90 sm:text-xl">
            <TypewriterText text="Comprehensive JAMB/UTME preparation with CBT practice, past questions, and mock examinations." speed={90} className="text-white/90" />
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center mt-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl transition-all hover:opacity-90 w-full sm:w-auto animate-button-enter"
              style={{
                backgroundColor: '#FFD700',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: 700,
                padding: '14px 28px',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                animationDelay: '0.6s',
                opacity: 0,
              }}
            >
              START JAMB PREP FREE
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center justify-center rounded-xl transition-all hover:bg-white/10 w-full sm:w-auto animate-button-enter"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                padding: '14px 28px',
                border: '1.5px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(4px)',
                animationDelay: '0.8s',
                opacity: 0,
              }}
            >
              VIEW PROGRAMS
            </Link>
          </div>
        </div>
      </section>
      <SubjectMarquee />
      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jambFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
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
            Ready to Start Your JAMB Prep?
          </h2>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have achieved high JAMB scores with our preparation program.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400 transition-all shadow-lg text-lg"
          >
            START JAMB PREP FREE
          </Link>
        </div>
      </section>
    </div>
  );
}



