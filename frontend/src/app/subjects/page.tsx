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
  { title: 'Civic Education', icon: Book, description: 'Civic Education syllabus and preparation.' },
  { title: 'English Language', icon: Book, description: 'English Language syllabus and preparation.' },
  { title: 'Mathematics', icon: Book, description: 'Mathematics syllabus and preparation.' },
  { title: 'Agricultural Science', icon: Book, description: 'Agricultural Science syllabus and preparation.' },
  { title: 'Biology', icon: Book, description: 'Biology syllabus and preparation.' },
  { title: 'Chemistry', icon: Book, description: 'Chemistry syllabus and preparation.' },
  { title: 'Computer Science', icon: Book, description: 'Computer Science syllabus and preparation.' },
  { title: 'Data Processing', icon: Book, description: 'Data Processing syllabus and preparation.' },
  { title: 'Digital Technology (ICT)', icon: Book, description: 'Digital Technology (ICT) syllabus and preparation.' },
  { title: 'Further Mathematics', icon: Book, description: 'Further Mathematics syllabus and preparation.' },
  { title: 'Geography', icon: Book, description: 'Geography syllabus and preparation.' },
  { title: 'Health Education', icon: Book, description: 'Health Education syllabus and preparation.' },
  { title: 'Physics', icon: Book, description: 'Physics syllabus and preparation.' },
  { title: 'Edo', icon: Book, description: 'Edo syllabus and preparation.' },
  { title: 'Efik', icon: Book, description: 'Efik syllabus and preparation.' },
  { title: 'French', icon: Book, description: 'French syllabus and preparation.' },
  { title: 'Hausa', icon: Book, description: 'Hausa syllabus and preparation.' },
  { title: 'Ibibio', icon: Book, description: 'Ibibio syllabus and preparation.' },
  { title: 'Igbo', icon: Book, description: 'Igbo syllabus and preparation.' },
  { title: 'Yoruba', icon: Book, description: 'Yoruba syllabus and preparation.' },
  { title: 'Art', icon: Book, description: 'Art syllabus and preparation.' },
  { title: 'CHRISTIAN RELIGIOUS STUDIES', icon: Book, description: 'CHRISTIAN RELIGIOUS STUDIES syllabus and preparation.' },
  { title: 'Government', icon: Book, description: 'Government syllabus and preparation.' },
  { title: 'History', icon: Book, description: 'History syllabus and preparation.' },
  { title: 'Islamic Studies', icon: Book, description: 'Islamic Studies syllabus and preparation.' },
  { title: 'Literature in English', icon: Book, description: 'Literature in English syllabus and preparation.' },
  { title: 'Music', icon: Book, description: 'Music syllabus and preparation.' },
  { title: 'Social Studies (Ghana)', icon: Book, description: 'Social Studies (Ghana) syllabus and preparation.' },
  { title: 'West African Traditional Religion', icon: Book, description: 'West African Traditional Religion syllabus and preparation.' },
  { title: 'Book Keeping', icon: Book, description: 'Book Keeping syllabus and preparation.' },
  { title: 'Business Management', icon: Book, description: 'Business Management syllabus and preparation.' },
  { title: 'Clerical Office Duties', icon: Book, description: 'Clerical Office Duties syllabus and preparation.' },
  { title: 'Commerce', icon: Book, description: 'Commerce syllabus and preparation.' },
  { title: 'Economics', icon: Book, description: 'Economics syllabus and preparation.' },
  { title: 'Financial Accounting', icon: Book, description: 'Financial Accounting syllabus and preparation.' },
  { title: 'Insurance', icon: Book, description: 'Insurance syllabus and preparation.' },
  { title: 'Marketing', icon: Book, description: 'Marketing syllabus and preparation.' },
  { title: 'Office Practice', icon: Book, description: 'Office Practice syllabus and preparation.' },
  { title: 'Shorthand', icon: Book, description: 'Shorthand syllabus and preparation.' },
  { title: 'Store Management', icon: Book, description: 'Store Management syllabus and preparation.' },
  { title: 'Tourism', icon: Book, description: 'Tourism syllabus and preparation.' },
  { title: 'Typewriting', icon: Book, description: 'Typewriting syllabus and preparation.' },
  { title: 'Animal Husbandry (ALT A)', icon: Book, description: 'Animal Husbandry (ALT A) syllabus and preparation.' },
  { title: 'Animal Husbandry ALT B', icon: Book, description: 'Animal Husbandry ALT B syllabus and preparation.' },
  { title: 'Auto Body Repairs', icon: Book, description: 'Auto Body Repairs syllabus and preparation.' },
  { title: 'Auto Electrical Work', icon: Book, description: 'Auto Electrical Work syllabus and preparation.' },
  { title: 'Auto Mechanical Work', icon: Book, description: 'Auto Mechanical Work syllabus and preparation.' },
  { title: 'Auto Parts Merchandising', icon: Book, description: 'Auto Parts Merchandising syllabus and preparation.' },
  { title: 'Basic Electricity/ Applied Electricity', icon: Book, description: 'Basic Electricity/ Applied Electricity syllabus and preparation.' },
  { title: 'Basketry', icon: Book, description: 'Basketry syllabus and preparation.' },
  { title: 'Building Construction', icon: Book, description: 'Building Construction syllabus and preparation.' },
  { title: 'Catering', icon: Book, description: 'Catering syllabus and preparation.' },
  { title: 'Ceramics', icon: Book, description: 'Ceramics syllabus and preparation.' },
  { title: 'Computer Hardware and GSM Repairs', icon: Book, description: 'Computer Hardware and GSM Repairs syllabus and preparation.' },
  { title: 'Fisheries (Alternative B)', icon: Book, description: 'Fisheries (Alternative B) syllabus and preparation.' },
  { title: 'Foods and Nutrition', icon: Book, description: 'Foods and Nutrition syllabus and preparation.' },
  { title: 'Forestry', icon: Book, description: 'Forestry syllabus and preparation.' },
  { title: 'Home Management', icon: Book, description: 'Home Management syllabus and preparation.' },
  { title: 'Mining', icon: Book, description: 'Mining syllabus and preparation.' },
  { title: 'Painting And Decorating', icon: Book, description: 'Painting And Decorating syllabus and preparation.' },
  { title: 'Radio, Television and Electronics Works', icon: Book, description: 'Radio, Television and Electronics Works syllabus and preparation.' },
  { title: 'Refrigeration And Air-Conditioning', icon: Book, description: 'Refrigeration And Air-Conditioning syllabus and preparation.' },
  { title: 'Technical Drawing', icon: Book, description: 'Technical Drawing syllabus and preparation.' },
  { title: 'Textiles', icon: Book, description: 'Textiles syllabus and preparation.' },
  { title: 'Welding', icon: Book, description: 'Welding syllabus and preparation.' },
  { title: 'Woodwork', icon: Book, description: 'Woodwork syllabus and preparation.' },
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



