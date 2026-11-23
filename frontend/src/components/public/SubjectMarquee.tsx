'use client';

import { BookOpen, GraduationCap, Book, Users, Newspaper, Phone, ArrowRight } from 'lucide-react';

const subjects = [
  { label: 'Mathematics', icon: BookOpen },
  { label: 'English Language', icon: Book },
  { label: 'Physics', icon: GraduationCap },
  { label: 'Chemistry', icon: BookOpen },
  { label: 'Biology', icon: Book },
  { label: 'Economics', icon: Users },
  { label: 'Government', icon: Newspaper },
  { label: 'Literature', icon: Book },
  { label: 'Further Mathematics', icon: BookOpen },
  { label: 'Computer Science', icon: GraduationCap },
  { label: 'Agricultural Science', icon: Book },
  { label: 'Civic Education', icon: Users },
];

export default function SubjectMarquee() {
  return (
    <section className="bg-primary-900 border-b border-primary-700 overflow-hidden">
      <div className="relative h-[60px] flex items-center">
        <div className="flex items-center animate-marquee">
          {subjects.map((subject, index) => (
            <div
              key={index}
              className="flex items-center gap-2 whitespace-nowrap mr-8"
            >
              <div className="w-6 h-6 rounded-full bg-primary-800 flex items-center justify-center border border-primary-600">
                <subject.icon className="h-3 w-3 text-primary-300" />
              </div>
              <span className="text-accent-400 font-medium text-xs sm:text-sm tracking-wide uppercase">
                {subject.label}
              </span>
            </div>
          ))}
          {subjects.map((subject, index) => (
            <div
              key={`dup-${index}`}
              className="flex items-center gap-2 whitespace-nowrap mr-8"
            >
              <div className="w-6 h-6 rounded-full bg-primary-800 flex items-center justify-center border border-primary-600">
                <subject.icon className="h-3 w-3 text-primary-300" />
              </div>
              <span className="text-accent-400 font-medium text-xs sm:text-sm tracking-wide uppercase">
                {subject.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
