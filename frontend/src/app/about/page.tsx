import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Award, Users, BookOpen, Target, CheckCircle } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { readdirSync } from 'fs';
import { join } from 'path';
import FloatingNav from '@/components/public/FloatingNav';
import { AboutHeroCarousel, StoryImageCarousel } from '@/components/public/AboutImageCarousels';
import CreativeFrame from '@/components/public/CreativeFrame';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import TypewriterText from '@/components/public/TypewriterText';
import AnimatedCounter from '@/components/AnimatedCounter';
import ScrollReveal from '@/components/public/ScrollReveal';

function readImages(folder: string, urlPrefix: string): { src: string; alt: string }[] {
  try {
    const dir = join(process.cwd(), 'public', 'images', folder);
    const files = readdirSync(dir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return files
      .filter((file) => imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
      .map((file) => ({
        src: urlPrefix + file,
        alt: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
  } catch (e) {
    return [];
  }
}

export default function AboutPage() {
  const excellenceImages = readImages('excellence', '/images/excellence/');
  const innovationImages = readImages('innovation', '/images/innovation/');
  const teamworkImages = readImages('teamwork', '/images/teamwork/');
  const historyImages = readImages('history', '/images/history/');

  const excellenceImgs = excellenceImages;
  const innovationImgs = innovationImages;
  const teamworkImgs = teamworkImages;
  const historyImgs = historyImages;

  return (
    <>
      <FloatingNav />
      <main className="min-h-screen bg-white relative">
        <section className="relative z-10 overflow-hidden">
          <AnimatedAcademicBackground />
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
              <TypewriterText text="About Edwardian Educational Consult" speed={120} className="text-white" />
            </h1>
            <p className="max-w-3xl text-base text-white/90 sm:text-xl">
              <TypewriterText text="Empowering students to achieve their academic dreams through innovative learning solutions" speed={90} className="text-white/90" />
            </p>
          </div>
        </section>
        <SubjectMarquee />

        <section className="overflow-hidden bg-primary-50 py-16 md:py-20 relative">
          <AnimatedAcademicBackground />
          <ScrollReveal>
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-6 relative z-10">
              <div>
                <span className="mb-3 inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700">
                  Our Story
                </span>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                  The Story of Edwardian
                </h2>
                <p className="text-lg leading-relaxed text-gray-600">
                  The history of Edwardian Educational Consult will be shared here. This space is
                  ready for the story and milestones you provide, so the account can be told
                  accurately in your own words.
                </p>
              </div>
              <div className="relative md:ml-4">
                <div className="absolute -inset-3 rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />
                <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0">
                  <StoryImageCarousel images={historyImgs} />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Mission Section */}
        <section className="py-16 relative overflow-hidden">
          <AnimatedAcademicBackground />
          <ScrollReveal>
            <div className="max-w-6xl mx-auto px-4 relative z-10">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                  <p className="text-gray-600 mb-4">
                    At Edwardian Educational Consult, we are dedicated to providing world-class educational
                    preparation services that equip students with the knowledge, skills, and confidence needed
                    to excel in their academic pursuits.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Our comprehensive approach combines cutting-edge technology with proven teaching methodologies
                    to deliver personalized learning experiences for every student.
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="text-center">
                      <AnimatedCounter end={5000} suffix="+" className="text-3xl font-bold text-gray-900" />
                      <p className="text-sm text-gray-500">Students</p>
                    </div>
                    <div className="text-center">
                      <AnimatedCounter end={95} suffix="%" className="text-3xl font-bold text-gray-900" />
                      <p className="text-sm text-gray-500">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <AnimatedCounter end={10} suffix="+" className="text-3xl font-bold text-gray-900" />
                      <p className="text-sm text-gray-500">Years Experience</p>
                    </div>
                  </div>
                </div>
                <div className="bg-primary-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-105 group-hover:bg-primary-50">
                      <GraduationCap className="w-10 h-10 text-primary-600 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <p className="font-medium text-gray-900">JAMB UTME</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-105 group-hover:bg-primary-50">
                      <BookOpen className="w-10 h-10 text-primary-600 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <p className="font-medium text-gray-900">WAEC/NECO</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-105 group-hover:bg-primary-50">
                      <Target className="w-10 h-10 text-primary-600 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <p className="font-medium text-gray-900">Post-UTME</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-105 group-hover:bg-primary-50">
                      <Award className="w-10 h-10 text-primary-600 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <p className="font-medium text-gray-900">JUPEB/IJMB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50 relative overflow-hidden">
          <AnimatedAcademicBackground />
          <ScrollReveal>
            <div className="max-w-6xl mx-auto px-4 relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
              <div className="space-y-12">
                {/* Excellence */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-white rounded-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <CheckCircle className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Excellence</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We strive for excellence in everything we do, from curriculum design to student support. Every lesson, every question, every interaction is crafted to the highest standard.
                    </p>
                  </div>
                  <div className="relative md:ml-4">
                    <div className="absolute -inset-3 rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />
                    <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 h-[280px] sm:h-[320px]">
                      <CreativeFrame images={excellenceImgs} />
                    </div>
                  </div>
                </div>

                {/* Student-Centered */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative md:ml-4 order-2 md:order-1">
                    <div className="absolute -inset-3 -rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />
                    <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 h-[280px] sm:h-[320px]">
                      <CreativeFrame images={excellenceImgs} />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group order-1 md:order-2">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Users className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Student-Centered</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Every decision we make is guided by what is best for our students&apos; learning journey. We put students first in curriculum, support, and experience.
                    </p>
                  </div>
                </div>

                {/* Innovation */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-white rounded-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Target className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Innovation</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We continuously innovate our teaching methods and technology to enhance learning outcomes. From CBT simulations to AI-powered analytics.
                    </p>
                  </div>
                  <div className="relative md:ml-4">
                    <div className="absolute -inset-3 rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />
                    <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 h-[280px] sm:h-[320px]">
                      <CreativeFrame images={innovationImgs} />
                    </div>
                  </div>
                </div>

                {/* Integrity */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative md:ml-4 order-2 md:order-1">
                    <div className="absolute -inset-3 -rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />
                    <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 h-[280px] sm:h-[320px]">
                      <CreativeFrame images={excellenceImgs} />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group order-1 md:order-2">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Award className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Integrity</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We maintain the highest standards of honesty and transparency in all our dealings with students, parents, and partners.
                    </p>
                  </div>
                </div>

                {/* Teamwork */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-white rounded-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <BookOpen className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Teamwork</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We believe in the power of collaboration between tutors, students, and parents to achieve shared academic goals.
                    </p>
                  </div>
                  <div className="relative md:ml-4">
                    <div className="absolute -inset-3 rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />
                    <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 h-[280px] sm:h-[320px]">
                      <CreativeFrame images={teamworkImgs} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden">
          <AnimatedAcademicBackground />
          <ScrollReveal>
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
              <p className="text-gray-600 mb-8">
                Join thousands of successful students who have achieved their academic goals with us.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Get Started Today
              </Link>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </>
  );
}
