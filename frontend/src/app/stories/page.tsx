'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Award, Users, TrendingUp, Calendar, Clock, ExternalLink, Play, Volume2, Trophy } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  subtitle: string;
  type: 'tutorial' | 'achievement' | 'success';
  description: string;
  date: string;
  readTime: string;
  image: string;
  author: string;
  category: string;
  studentsHelped?: string;
  scoreImprovement?: string;
  icon: React.ElementType;
}

const stories: Story[] = [
  {
    id: 1,
    title: 'From Zero to JAMB 340+',
    subtitle: 'Sarah Johnson\'s Journey to Success',
    type: 'success',
    description: 'How one student transformed her academic journey from failing mock tests to scoring 340 in JAMB 2026 with our personalized tutoring program.',
    date: 'September 25, 2026',
    readTime: '8 min read',
    image: '/images/student-1.png',
    author: 'Edwardian Team',
    category: 'Success Stories',
    studentsHelped: '2,000+ students',
    scoreImprovement: '140 point increase',
    icon: Award,
  },
  {
    id: 2,
    title: 'Mastering CBT: Time Management Secrets',
    subtitle: 'Expert Strategies for Computer-Based Tests',
    type: 'tutorial',
    description: 'Learn proven techniques for managing your time effectively during Computer-Based Tests to maximize your score potential.',
    date: 'September 20, 2026',
    readTime: '12 min read',
    image: '/images/student-2.png',
    author: 'Dr. Adeola Smith',
    category: 'Tutorials',
    icon: BookOpen,
  },
  {
    id: 3,
    title: 'WAEC Chemistry: Acid-Base Mastery',
    subtitle: 'Complete Guide to Common Questions',
    type: 'tutorial',
    description: 'A comprehensive walkthrough of acid-base reactions, neutralization calculations, and pH problems that frequently appear in WAEC exams.',
    date: 'September 18, 2026',
    readTime: '15 min read',
    image: '/images/student-3.png',
    author: 'Prof. James Okonkwo',
    category: 'Tutorials',
    icon: BookOpen,
  },
  {
    id: 4,
    title: 'Post-UTME Success: UNILAG Cut-off Cracked',
    subtitle: 'How We Prepared 500+ Students for UNILAG',
    type: 'achievement',
    description: 'Our specialized Post-UTME program helped over 500 students gain admission into the University of Lagos this year.',
    date: 'September 15, 2026',
    readTime: '10 min read',
    image: '/images/student-1.png',
    author: 'Edwafarian Admissions Team',
    category: 'Achievements',
    studentsHelped: '500+ admissions',
    icon: Award,
  },
  {
    id: 5,
    title: 'Understanding JAMB Grading System',
    subtitle: 'Score vs. Points Explained',
    type: 'tutorial',
    description: 'Demystify how JAMB converts your raw scores to the grading system used for university admissions.',
    date: 'September 10, 2026',
    readTime: '7 min read',
    image: '/images/student-2.png',
    author: 'Mr. Peter Chukwuebuka',
    category: 'Tutorials',
    icon: BookOpen,
  },
  {
    id: 6,
    title: 'From 32 to 280: Michael\'s WAEC Journey',
    subtitle: 'Remarkable Comeback Story',
    type: 'success',
    description: 'After an initial poor performance, Michael used our intensive revision program to achieve an impressive 280 aggregate in WAEC 2026.',
    date: 'September 5, 2026',
    readTime: '9 min read',
    image: '/images/student-3.png',
    author: 'Edwardian Team',
    category: 'Success Stories',
    studentsHelped: '1,500+ students',
    scoreImprovement: '248 point increase',
    icon: TrendingUp,
  },
];

const typeColors: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  tutorial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  achievement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const typeIcons: Record<string, React.ElementType> = {
  success: Award,
  tutorial: BookOpen,
  achievement: Trophy,
};

export default function StoriesPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Stories & Tutorials | Edwardian Educational Consult';
  }, []);

  const filteredStories = stories.filter((story) => {
    const matchesFilter = activeFilter === 'all' || story.type === activeFilter;
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { value: 'all', label: 'All Stories' },
    { value: 'success', label: 'Success Stories' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'achievement', label: 'Achievements' },
  ];

  return (
    <div className="min-h-screen bg-primary-800 text-white">
      <header className="border-b border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="flex items-center gap-1 text-primary-300 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold font-heading mb-4">
              Stories & Tutorials
            </h1>
            <p className="text-lg text-primary-300 max-w-2xl mx-auto">
              Discover inspiring success stories, expert tutorials, and achievement highlights from our learning community.
            </p>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-primary-900 border border-primary-700 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-colors"
              />
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.value
                    ? 'bg-accent-400 text-primary-900'
                    : 'bg-primary-900 text-primary-300 hover:bg-primary-700 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredStories.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <p className="text-primary-300">No stories found matching your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => {
                const Icon = story.icon;
                const TypeIcon = typeIcons[story.type];
                return (
                  <article
                    key={story.id}
                    className="bg-primary-900 rounded-xl border border-primary-700 overflow-hidden hover:border-accent-500/30 hover:shadow-xl hover:shadow-accent-500/5 transition-all group"
                  >
                    <div className="aspect-video bg-primary-800 relative overflow-hidden">
                      {story.image ? (
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-12 h-12 text-primary-600" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${typeColors[story.type]}`}>
                          <TypeIcon className="w-3 h-3 inline mr-0.5" />
                          {story.type}
                        </span>
                      </div>
                      {story.type === 'tutorial' && (
                        <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-primary-800/80 flex items-center justify-center text-white">
                          <Play className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3 text-xs text-primary-400">
                        <Calendar className="w-3 h-3" />
                        <span>{story.date}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{story.readTime}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-accent-400 transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-primary-300 text-sm mb-3 line-clamp-2">{story.description}</p>

                      {story.studentsHelped && (
                        <div className="flex items-center gap-2 text-xs text-primary-400 mb-2">
                          <Users className="w-3 h-3" />
                          <span>{story.studentsHelped} helped</span>
                        </div>
                      )}

                      {story.scoreImprovement && (
                        <div className="flex items-center gap-2 text-xs text-primary-400 mb-2">
                          <TrendingUp className="w-3 h-3" />
                          <span>{story.scoreImprovement}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-primary-800 mt-3">
                        <span className="text-xs text-primary-400">{story.author}</span>
                        <Link
                          href={`/stories/${story.id}`}
                          className="flex items-center gap-1 text-xs font-medium text-accent-400 hover:text-accent-300"
                        >
                          Read Full Story
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-primary-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-400 text-sm">
          <p>© 2026 Edwardian Educational Consult. All stories are property of their respective authors.</p>
        </div>
      </footer>
    </div>
  );
}
