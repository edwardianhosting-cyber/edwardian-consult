'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, GraduationCap, Mail, Phone, Linkedin, Twitter, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import { AboutHeroCarousel } from '@/components/public/AboutImageCarousels';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import TypewriterText from '@/components/public/TypewriterText';

const teamMembers = [];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => {
    fetch('http://localhost:5001/team').then(r => r.json()).then(setMembers).catch(() => {});
  }, []);
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
            <TypewriterText text="Our Team" speed={120} className="text-white" />
          </h1>
          <p className="max-w-3xl text-base text-white/90 sm:text-xl">
            <TypewriterText text="Learn from experienced educators dedicated to your academic success." speed={90} className="text-white/90" />
          </p>
        </div>
      </section>
      <SubjectMarquee />
      {/* Team Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
                <Link href={`/team/${member.id}`} className="block">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {member.image ? (
                    <Image src={member.image} alt={member.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">{member.bio}</p>
                  <div className="flex gap-2">
                    {member.socials && Object.entries(member.socials).map(([key, url]) => {
                      if (!url) return null;
                      let href = String(url);
                      const icons: any = { facebook: Facebook, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, whatsapp: MessageCircle };
                      const Icon = icons[key] || Phone;
                      if (key === 'whatsapp') href = `https://wa.me/${href.replace(/\D/g, '')}`;
                      return (
                        <a key={key} href={href} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-colors">
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
                </Link>
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
            Learn from the Best
          </h2>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            Our expert tutors are ready to guide you to academic excellence.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-primary-900 font-semibold rounded-xl hover:bg-accent-400 transition-all shadow-lg text-lg"
          >
            Contact Our Team
          </Link>
        </div>
      </section>
    </div>
  );
}



