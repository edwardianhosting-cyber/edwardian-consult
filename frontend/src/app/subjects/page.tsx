import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, GraduationCap, Book, Users, Newspaper, Phone } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import { AboutHeroCarousel } from '@/components/public/AboutImageCarousels';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import TypewriterText from '@/components/public/TypewriterText';

const subjects = [
  {
    title: 'Mathematics',
    icon: BookOpen,
    description: 'Core mathematics covering algebra, geometry, trigonometry, calculus, and statistics for all major examinations.',
  },
  {
    title: 'English Language',
    icon: Book,
    description: 'Comprehensive English language including grammar, comprehension, essay writing, and oral English.',
  },
  {
    title: 'Physics',
    icon: GraduationCap,
    description: 'Physics covering mechanics, thermodynamics, electromagnetism, optics, and modern physics.',
  },
  {
    title: 'Chemistry',
    icon: BookOpen,
    description: 'Chemistry including organic, inorganic, physical chemistry, and practical laboratory work.',
  },
  {
    title: 'Biology',
    icon: Book,
    description: 'Biology covering cell biology, genetics, ecology, human anatomy, and plant physiology.',
  },
  {
    title: 'Economics',
    icon: Users,
    description: 'Economics including microeconomics, macroeconomics, economic systems, and current economic issues.',
  },
  {
    title: 'Government',
    icon: Newspaper,
    description: 'Government and civic education covering political systems, constitutions, and international relations.',
  },
  {
    title: 'Literature',
    icon: Book,
    description: 'Literature in English covering prose, poetry, drama, and literary appreciation.',
  },
  {
    title: 'Further Mathematics',
    icon: BookOpen,
    description: 'Advanced mathematics for students preparing for further mathematics papers in external examinations.',
  },
  {
    title: 'Computer Science',
    icon: GraduationCap,
    description: 'Computer science fundamentals including programming, algorithms, data structures, and ICT.',
  },
  {
    title: 'Agricultural Science',
    icon: Book,
    description: 'Agricultural science covering crop production, animal husbandry, soil science, and agricultural economics.',
  },
  {
    title: 'Civic Education',
    icon: Users,
    description: 'Civic education covering citizens rights, duties, national values, and constitutional obligations.',
  },
];

export default function SubjectsPage() {
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
            <TypewriterText text="Our Subjects" speed={120} className="text-white" />
          </h1>
          <p className="max-w-3xl text-base text-white/90 sm:text-xl">
            <TypewriterText text="Comprehensive subject coverage for JAMB, WAEC, NECO, Post-UTME, and all major examinations." speed={90} className="text-white/90" />
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
              GET STARTED FREE
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
      {/* Subjects Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject, index) => (
              <Link
                key={index}
                href={`/subjects/${subject.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                  <subject.icon className="h-7 w-7 text-primary-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {subject.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  {subject.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-primary-800 overflow-hidden">
          <AnimatedAcademicBackground />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            Join thousands of students mastering their subjects with Edwardian Educational Consult.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400 transition-all shadow-lg text-lg"
          >
            BECOME A STUDENT FREE
          </Link>
        </div>
      </section>
    </div>
  );
}



