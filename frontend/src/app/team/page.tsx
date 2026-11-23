import Link from 'next/link';
import Image from 'next/image';
import { Users, GraduationCap, Mail, Phone, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import { AboutHeroCarousel } from '@/components/public/AboutImageCarousels';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import TypewriterText from '@/components/public/TypewriterText';

const teamMembers = [
  {
    name: 'Dr. Adeola Samuel',
    role: 'Principal Consultant',
    bio: 'Over 15 years of experience in educational consulting and examination preparation.',
    image: '/images/team/adeola.jpg',
  },
  {
    name: 'Mr. Chinedu Okafor',
    role: 'Head of Academics',
    bio: 'Expert in JAMB and Post-UTME preparation with a proven track record of student success.',
    image: '/images/team/chinedu.jpg',
  },
  {
    name: 'Mrs. Fatima Yusuf',
    role: 'Senior Tutor - Sciences',
    bio: 'Specialist in Physics, Chemistry, and Biology with 10+ years of teaching experience.',
    image: '/images/team/fatima.jpg',
  },
  {
    name: 'Mr. Tunde Adebayo',
    role: 'Senior Tutor - Arts',
    bio: 'Expert in English, Literature, and Government with passion for student mentorship.',
    image: '/images/team/tunde.jpg',
  },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function TeamPage() {
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
              href="/contact"
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
              CONTACT US
            </Link>
          </div>
        </div>
      </section>
      <SubjectMarquee />
      {/* Team Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">{member.bio}</p>
                  <div className="flex gap-2">
                    {socialLinks.map((social, idx) => (
                      <Link
                        key={idx}
                        href={social.href}
                        className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-colors"
                      >
                        <social.icon className="h-4 w-4" />
                      </Link>
                    ))}
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



