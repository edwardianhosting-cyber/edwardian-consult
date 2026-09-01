import Link from 'next/link';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Admission News & Updates</h1>
          <p className="text-xl text-primary-200 max-w-3xl mx-auto">
            Stay informed with the latest news about JAMB, WAEC, NECO, and university admissions
          </p>
        </div>
      </section>

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
