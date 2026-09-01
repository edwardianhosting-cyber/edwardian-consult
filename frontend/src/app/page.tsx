import Link from 'next/link';
import HeroCarousel from '@/components/public/HeroCarousel';
import { BookOpen, Award, Users, TrendingUp, CheckCircle, ArrowRight, Star, Shield, Clock, BookMarked } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';

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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-800">
      {/* Full Width Hero Carousel */}
      <HeroCarousel />

      {/* Stats Section */}
      <section className="py-16 bg-primary-800 border-b border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <section className="py-20 lg:py-28 bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                href={`/programs/${program.slug}`}
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
      <section className="py-20 lg:py-28 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-primary-900 border-t border-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
  );
}
