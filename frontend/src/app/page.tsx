import Link from 'next/link';
import HeroCarousel from '@/components/public/HeroCarousel';
import FloatingNav from '@/components/public/FloatingNav';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import { BookOpen, Award, Users, TrendingUp, CheckCircle, ArrowRight, Star, Shield, Clock, BookMarked, Calendar, Newspaper } from 'lucide-react';
import Image from 'next/image';
import AnimatedCounter from '@/components/AnimatedCounter';
import AnimatedFormulasBackground from '@/components/public/AnimatedFormulasBackground';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import HomeRedirect from './home-redirect';

const stats = [
  { value: '5,000+', label: 'Students Enrolled', icon: Users, numericValue: 5000 },
  { value: '95%', label: 'Success Rate', icon: TrendingUp, numericValue: 95, suffix: '%' },
  { value: '50,000+', label: 'Questions Available', icon: BookOpen, numericValue: 50000 },
  { value: '10+', label: 'Years Experience', icon: Award, numericValue: 10, suffix: '+' },
];

const programs = [
  {
    title: 'JAMB/UTME Preparation',
    slug: 'jamb-utme',
    description: 'Comprehensive preparation for the Unified Tertiary Matriculation Examination with practice questions and mock exams.',
    icon: BookOpen,
  },
  {
    title: 'Post-UTME Training',
    slug: 'post-utme',
    description: 'Specialized training for university-specific post-UTME screenings including UI, OAU, UNILAG, and more.',
    icon: Award,
  },
  {
    title: 'WAEC/NECO Prep',
    slug: 'waec-neco',
    description: 'Complete preparation for O-level examinations with past questions and detailed explanations.',
    icon: CheckCircle,
  },
  {
    title: 'JUPEB/IJMB A-Levels',
    slug: 'jupeb-ijmb',
    description: 'Direct entry preparation programs for students seeking admission into 200 level.',
    icon: Shield,
  },
];

const features = [
  { title: 'Expert Tutors', description: 'Learn from experienced educators with years of proven results' },
  { title: 'CBT Practice', description: 'Real-time computer-based testing environment that mimics actual exams' },
  { title: 'Parent Portal', description: 'Parents can monitor progress, attendance, and performance in real-time' },
  { title: 'Instant Results', description: 'Get detailed score breakdowns and weak topic identification immediately' },
  { title: 'Study Materials', description: 'Access downloadable PDF notes, past questions, and video tutorials' },
  { title: '24/7 Access', description: 'Study anytime, anywhere with our online platform' },
];

const testimonials = [
  {
    name: 'Grace Okafor',
    school: 'Federal Govt College, Enugu',
    quote: 'The CBT practice tests helped me score 310 in JAMB. I got admission into Medicine.',
    result: 'JAMB 310',
    avatar: '/logo.png',
  },
  {
    name: 'Samuel Adebayo',
    school: 'Methodist Boys High School, Lagos',
    quote: 'Excellent WAEC preparation. The past questions and explanations made all the difference.',
    result: 'WAEC 8 As',
    avatar: '/logo.png',
  },
  {
    name: 'Chinonso Nwosu',
    school: 'Loyola Jesuit College, Abuja',
    quote: 'Post-UTME training was comprehensive. I scored high and got my first choice university.',
    result: 'Post-UTME Distinction',
    avatar: '/logo.png',
  },
];

const featuredNews = [
  {
    id: '1',
    title: 'JAMB 2026 Registration Guidelines Released',
    excerpt: 'The Joint Admissions and Matriculation Board has released the official registration guidelines for the 2026 UTME examination.',
    category: 'JAMB',
    date: '2026-08-20',
  },
  {
    id: '2',
    title: 'WAEC Releases 2026 Exam Timetable',
    excerpt: 'The West African Examinations Council has published the official timetable for the 2026 WASSCE examination.',
    category: 'WAEC',
    date: '2026-08-18',
  },
  {
    id: '3',
    title: 'Top 10 Universities in Nigeria 2026',
    excerpt: 'See the latest ranking of Nigerian universities based on academic excellence, research output, and graduate employability.',
    category: 'Admission',
    date: '2026-08-15',
  },
];

export default function HomePage() {
  return (
    <>
      <HomeRedirect />
      <FloatingNav />
      <div className="min-h-screen bg-primary-800">
         {/* Full Width Hero Carousel */}
        <HeroCarousel />
        <SubjectMarquee />
        {/* Stats Section */}
        <section className="relative py-16 bg-primary-800 border-b border-primary-700 overflow-hidden">
          <AnimatedAcademicBackground />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-600">
                    <stat.icon className="h-8 w-8 text-accent-500" />
                  </div>
                  <AnimatedCounter end={stat.numericValue} suffix={stat.suffix || '+'} />
                  <div className="text-primary-300 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="relative py-20 lg:py-28 bg-primary-900 overflow-hidden">
          <AnimatedAcademicBackground />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
                Our Programs
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading mb-4">
                Choose Your Path to Success
              </h2>
              <p className="text-lg text-primary-300 max-w-2xl mx-auto">
                Comprehensive preparation programs designed to help you excel in your examinations and secure admission.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.map((program, index) => (
                <Link
                  key={index}
                  href="/programs"
                  className="bg-primary-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-primary-600 group block"
                >
                  <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-500 transition-colors border border-primary-500">
                    <program.icon className="h-7 w-7 text-accent-400 group-hover:text-primary-900 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{program.title}</h3>
                  <p className="text-primary-300 text-sm mb-4 leading-relaxed">{program.description}</p>
                  <span className="inline-flex items-center gap-1 text-accent-400 font-medium text-sm group-hover:gap-2 transition-all">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 lg:py-28 bg-primary-800 overflow-hidden">
          <AnimatedAcademicBackground />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
                  Why Choose Us
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading mb-6">
                  Everything You Need to Succeed
                </h2>
                <p className="text-lg text-primary-300 mb-8">
                  We provide a complete ecosystem for academic success, from expert guidance to cutting-edge technology.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-primary-700 rounded-xl border border-primary-600">
                      <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-primary-900" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{feature.title}</h4>
                        <p className="text-sm text-primary-300">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-primary-700 rounded-3xl p-8 lg:p-12 border border-primary-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-600 rounded-xl p-6 text-center shadow-sm border border-primary-500">
                      <Clock className="h-8 w-8 text-accent-400 mx-auto mb-2" />
                      <div className="text-white font-bold">24/7</div>
                      <div className="text-primary-300 text-sm">Access</div>
                    </div>
                    <div className="bg-primary-600 rounded-xl p-6 text-center shadow-sm border border-primary-500">
                      <Users className="h-8 w-8 text-accent-400 mx-auto mb-2" />
                      <div className="text-white font-bold">Live</div>
                      <div className="text-primary-300 text-sm">Tutoring</div>
                    </div>
                    <div className="bg-primary-600 rounded-xl p-6 text-center shadow-sm border border-primary-500">
                      <BookMarked className="h-8 w-8 text-accent-400 mx-auto mb-2" />
                      <div className="text-white font-bold">PDF</div>
                      <div className="text-primary-300 text-sm">Notes</div>
                    </div>
                    <div className="bg-primary-600 rounded-xl p-6 text-center shadow-sm border border-primary-500">
                      <Award className="h-8 w-8 text-accent-400 mx-auto mb-2" />
                      <div className="text-white font-bold">Cert</div>
                      <div className="text-primary-300 text-sm">Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Testimonials */}
        <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
          <AnimatedAcademicBackground />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
                Student Stories
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-heading mb-6">
                What Our Students Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from students who have achieved their academic goals with Edwardian Educational Consult.
              </p>
            </div>
            <div className="relative h-[200px] overflow-hidden">
              <div className="flex items-center animate-marquee will-change-transform">
                {testimonials.map((t, index) => (
                  <div key={index} className="flex-none shrink-0 mr-12">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-w-[320px]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden border border-gray-200">
                          <Image src={t.avatar} alt={t.name} width={40} height={40} className="object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
                          <p className="text-xs text-gray-500">{t.school}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-6">
                        "{t.quote}"
                      </p>
                      <span className="text-xs text-primary-600 font-medium">{t.result}</span>
                    </div>
                  </div>
                ))}
                {testimonials.map((t, index) => (
                  <div key={`dup-${index}`} className="flex-none shrink-0 mr-12">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-w-[320px]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden border border-gray-200">
                          <Image src={t.avatar} alt={t.name} width={40} height={40} className="object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
                          <p className="text-xs text-gray-500">{t.school}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-6">
                        "{t.quote}"
                      </p>
                      <span className="text-xs text-primary-600 font-medium">{t.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Latest News */}
        <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
          <AnimatedAcademicBackground />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
                Latest News
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-heading mb-6">
                Admission News & Updates
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Stay informed with the latest news about JAMB, WAEC, NECO, and university admissions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded font-medium">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.date).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                    <Link
                      href="/news"
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 lg:py-24 bg-primary-900 border-t border-primary-700 overflow-hidden">
          <AnimatedAcademicBackground />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-primary-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have achieved their academic dreams with Edwardian Educational Consult.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-500 text-primary-900 font-bold rounded-xl hover:bg-accent-400 transition-all shadow-lg text-lg"
              >
                BECOME A STUDENT
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg text-lg"
              >
                LOGIN
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-lg"
              >
                Parent Portal
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}


