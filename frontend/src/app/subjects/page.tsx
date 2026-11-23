'use client';

import { useState } from 'react';
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
  { title: 'History', icon: Book, description: 'History covering Nigerian, African, and world history with emphasis on key events and civilizations.' },
  { title: 'Geography', icon: BookOpen, description: 'Geography including physical, human, and regional geography with map reading skills.' },
  { title: 'Accounting', icon: BookOpen, description: 'Financial accounting covering bookkeeping, final accounts, and financial statements.' },
  { title: 'Commerce', icon: Users, description: 'Commerce covering trade, business organizations, and commercial law.' },
  { title: 'French', icon: Book, description: 'French language covering grammar, comprehension, and oral communication.' },
  { title: 'Yoruba', icon: Book, description: 'Yoruba language and literature covering grammar, prose, poetry, and culture.' },
  { title: 'Igbo', icon: Book, description: 'Igbo language and literature covering grammar, prose, poetry, and culture.' },
  { title: 'Hausa', icon: Book, description: 'Hausa language and literature covering grammar, prose, poetry, and culture.' },
  { title: 'Technical Drawing', icon: BookOpen, description: 'Technical drawing covering projections, isometric views, and engineering graphics.' },
  { title: 'Fine Arts', icon: Book, description: 'Fine arts covering drawing, painting, and art appreciation.' },
];

export default function SubjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
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

      {/* Can't find subject */}
      <section className="py-20 lg:py-28 bg-primary-800 relative overflow-hidden">
        <AnimatedAcademicBackground />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading mb-4">
            Can't find your subject?
          </h2>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            Let us know which subject you need and we'll get back to you with the right resources and tutoring support.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400 transition-all shadow-lg text-lg"
          >
            Message Us
          </button>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Can't find your subject?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the subject you need"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <a
                href={`https://wa.me/2347055432059?text=${encodeURIComponent(`Hello, my name is ${name} and I can't find ${subject} subject, can you help me with it please?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-accent-500 text-primary-900 font-semibold rounded-lg hover:bg-accent-400 transition-colors text-center"
              >
                Message Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



