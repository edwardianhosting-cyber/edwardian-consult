import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import FloatingNav from '@/components/public/FloatingNav';
import SubjectMarquee from '@/components/public/SubjectMarquee';
import { AboutHeroCarousel } from '@/components/public/AboutImageCarousels';
import AnimatedAcademicBackground from '@/components/public/AnimatedAcademicBackground';
import TypewriterText from '@/components/public/TypewriterText';

const newsArticles = [
  {
    id: '1',
    title: 'JAMB 2026 Registration Guidelines Released',
    excerpt: 'The Joint Admissions and Matriculation Board has released the official registration guidelines for the 2026 UTME examination...',
    category: 'JAMB',
    date: '2026-08-20',
    image: '/images/news/jamb.jpg',
  },
  {
    id: '2',
    title: 'WAEC Releases 2026 Exam Timetable',
    excerpt: 'The West African Examinations Council has published the official timetable for the 2026 WASSCE examination...',
    category: 'WAEC',
    date: '2026-08-18',
    image: '/images/news/waec.jpg',
  },
  {
    id: '3',
    title: 'Top 10 Universities in Nigeria 2026',
    excerpt: 'See the latest ranking of Nigerian universities based on academic excellence, research output, and graduate employability...',
    category: 'Admission',
    date: '2026-08-15',
    image: '/images/news/universities.jpg',
  },
  {
    id: '4',
    title: 'How to Choose the Right Course for JAMB',
    excerpt: 'Choosing the right course is crucial for your academic success. Here are expert tips to help you make the best decision...',
    category: 'Guidance',
    date: '2026-08-12',
    image: '/images/news/courses.jpg',
  },
  {
    id: '5',
    title: 'Post-UTME Screening Dates Announced',
    excerpt: 'Several universities have announced their Post-UTME screening dates for the 2026/2027 academic session...',
    category: 'Post-UTME',
    date: '2026-08-10',
    image: '/images/news/postutme.jpg',
  },
  {
    id: '6',
    title: 'Scholarship Opportunities for Nigerian Students',
    excerpt: 'A comprehensive list of available scholarships for Nigerian students both locally and internationally...',
    category: 'Scholarship',
    date: '2026-08-08',
    image: '/images/news/scholarship.jpg',
  },
];

const categories = ['All', 'JAMB', 'WAEC', 'NECO', 'Post-UTME', 'Admission', 'Guidance', 'Scholarship'];

export default function NewsPage() {
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
            <TypewriterText text="Admission News & Updates" speed={120} className="text-white" />
          </h1>
          <p className="max-w-3xl text-base text-white/90 sm:text-xl">
            <TypewriterText text="Stay informed with the latest news about JAMB, WAEC, NECO, and university admissions" speed={90} className="text-white/90" />
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
      {/* Categories */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-gray-400" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Never Miss an Update</h2>
          <p className="text-gray-600 mb-6">
            Register with us to receive personalized news and updates about your exams and admissions.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
}



