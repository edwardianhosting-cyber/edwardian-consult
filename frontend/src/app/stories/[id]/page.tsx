'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, Award, TrendingUp, Users } from 'lucide-react';

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
  fullContent: string[];
  keyTakeaways: string[];
  authorBio: string;
}

const stories: Story[] = [
  {
    id: 1,
    title: 'From Zero to JAMB 340+',
    subtitle: 'Sarah Johnson Journey to Success',
    type: 'success',
    description: 'How one student transformed her academic journey from failing mock tests to scoring 340 in JAMB 2026 with our personalized tutoring program.',
    date: 'September 25, 2026',
    readTime: '8 min read',
    image: '/images/student-1.png',
    author: 'Dr. Adeola Smith',
    category: 'Success Stories',
    studentsHelped: '2,000+ students',
    scoreImprovement: '140 point increase',
    icon: Award,
    fullContent: [
      `Sarah Johnson entered our JAMB preparation program in January 2026 with a diagnostic mock score of just 200. She struggled with time management and had significant gaps in her Physics and Chemistry knowledge.`,
      `Our personalized approach included one-on-one tutoring sessions, adaptive question banks, and weekly progress assessments. We identified her weak areas and created a targeted study schedule.`,
      `Over 8 months of consistent preparation, Sarah improved her scores steadily. Her mock test scores climbed from 200 to 320, and finally, she achieved 340 in the actual JAMB 2026 examination.`,
      `Sarah's success story is now featured in our student spotlight program, inspiring other students to believe that dramatic improvement is possible with the right guidance.`,
      `The key factors that contributed to Sarah's success were consistent practice, expert mentorship, and our adaptive learning technology that adjusted to her pace.`,
    ],
    keyTakeaways: [
      `Consistent practice with adaptive questions is crucial for JAMB success`,
      `One-on-one tutoring can identify and address specific knowledge gaps`,
      `Time management is as important as content mastery in computer-based tests`,
      `Regular mock exams help build confidence and exam stamina`,
    ],
    authorBio: `Dr. Adeola Smith is a senior academic coordinator at Edwardian Educational Consult with over 12 years of experience in JAMB and Post-UTME preparation. She has helped over 5,000 students achieve their admission goals.`,
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
    author: 'Mr. Peter Chukwuebuka',
    category: 'Tutorials',
    icon: BookOpen,
    fullContent: [
      `Time management is one of the biggest challenges students face in Computer-Based Tests (CBT). With only 3 hours to answer 180 questions across 4 subjects, every second counts.`,
      `Our research with over 1,000 students shows that effective time management can improve scores by up to 50 points. Here are the key strategies:`,
      `First, practice with our CBT simulator to get comfortable with the interface. The simulator mimics the actual JAMB CBT environment, helping you build muscle memory.`,
      `Second, use the "2-minute rule": if a question takes more than 2 minutes, mark it and move on. Return to difficult questions only if time permits.`,
      `Third, master the shortcut keys. Our CBT simulator supports keyboard shortcuts that can save you up to 15 minutes on a 180-question exam.`,
      `Finally, pace yourself evenly. Aim to complete 60 questions per hour, leaving buffer time for review. Practice this pacing in every mock exam.`,
    ],
    keyTakeaways: [
      `Use the 2-minute rule: skip hard questions and return later`,
      `Practice with CBT simulators to build familiarity with the interface`,
      `Master keyboard shortcuts to save time during the exam`,
      `Maintain steady pacing: 60 questions per hour with buffer time`,
    ],
    authorBio: `Mr. Peter Chukwuebuka is the head of CBT training at Edwardian Educational Consult. He has trained over 3,000 students on computer-based test strategies and has an 89% success rate in helping students achieve their target scores.`,
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
    fullContent: [
      `Acid-base chemistry is one of the most tested topics in WAEC Senior Secondary Certificate Examination (SSCE). Mastering this topic can significantly boost your overall score.`,
      `Key concepts include: Arrhenius definition, Bronsted-Lowry theory, pH scale, buffer solutions, and neutralization reactions. Each of these appears in multiple-choice and theory sections.`,
      `For neutralization calculations, remember the formula: H+ + OH- {result} H2O. The key is balancing the equation first, then using stoichiometry to find unknown concentrations or volumes.`,
      `Practice problems involving strong acids (HCl, H2SO4) and strong bases (NaOH, KOH) are the most common. Weak acid and weak base problems are more complex but equally important.`,
      `Buffer solution problems require the Henderson-Hasselbalch equation. Remember that buffer solutions resist changes in pH when small amounts of acid or base are added.`,
      `For pH calculations, memorize the 7 key points: pH 7 = neutral, pH {result} 7 = acidic, pH {result} 7 = basic, and the pH of common solutions at 25 C.`,
    ],
    keyTakeaways: [
      `Memorize the pH scale and common strong acids/bases`,
      `Master neutralization calculations using stoichiometry`,
      `Understand buffer solutions and the Henderson-Hasselbalch equation`,
      `Practice titration problems regularly for exam preparedness`,
    ],
    authorBio: `Prof. James Okonkwo is a senior chemistry lecturer with 18 years of experience teaching WAEC and JAMB chemistry. He is the author of the bestselling Chemistry Simplified textbook series and has mentored over 2,500 students to A1 grades in WAEC.`,
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
    author: 'Dr. Sarah Adeyemi',
    category: 'Achievements',
    studentsHelped: '500+ admissions',
    icon: Award,
    fullContent: [
      `The University of Lagos (UNILAG) has one of the most competitive Post-UTME processes in Nigeria, with a cut-off mark that varies yearly based on applicant quality.`,
      `In 2026, UNILAG Post-UTME cut-off ranged from 65 to 85, depending on the course. Our program prepared 500+ students, and 425 of them successfully gained admission into their preferred courses.`,
      `Our approach focuses on three key areas: subject mastery, test-taking strategies, and mental preparation. We provide past questions from the last 5 years, expert-led tutorials, and personalized feedback.`,
      `Students receive a tailored study plan that covers UNILAG specific question patterns. Our CBT simulator includes UNILAG-style questions that mirror the actual exam format.`,
      `The success rate for our UNILAG program is 85%, significantly higher than the 60% national average. This is because we focus on quality preparation rather than quantity.`,
      `Beyond academics, we provide moral support through mentorship sessions and motivation talks. This holistic approach ensures students are both academically and mentally prepared.`,
    ],
    keyTakeaways: [
      `UNILAG cut-off marks vary yearly; thorough preparation is essential`,
      `Past questions analysis helps identify recurring question patterns`,
      `CBT simulation builds familiarity with the computer-based format`,
      `Holistic preparation includes both academic and mental readiness`,
    ],
    authorBio: `Dr. Sarah Adeyemi is the Post-UTME program coordinator at Edwardian Educational Consult. She holds a PhD in Educational Psychology and has overseen the successful admission of over 2,000 students into top Nigerian universities over the past 5 years.`,
  },
  {
    id: 5,
    title: 'JAMB Score Improvement Guide',
    subtitle: 'Raising Your Score by 100+ Points',
    type: 'tutorial',
    description: 'Proven strategies to dramatically improve your JAMB score in just 6 weeks, based on data from 1,000+ successful students.',
    date: 'September 10, 2026',
    readTime: '9 min read',
    image: '/images/student-2.png',
    author: 'Mr. Tunde Bakare',
    category: 'Tutorials',
    icon: BookOpen,
    fullContent: [
      `Improving your JAMB score by 100+ points in 6 weeks is achievable with the right strategy. Based on our analysis of 1,000 successful students, these are the most impactful approaches.`,
      `First, diagnose your weak areas. Take a diagnostic test covering all four JAMB subjects. Identify the topics where you score below 50% and prioritize those.`,
      `Second, use active recall instead of passive reading. Test yourself frequently with flashcards and practice questions. The forgetting curve shows that spaced repetition maximizes retention.`,
      `Third, focus on high-yield topics. In Physics, focus on mechanics, waves, and electricity. In Chemistry, focus on atomic structure, bonding, and organic chemistry.`,
      `Fourth, practice time management. JAMB gives you 3 hours for 180 questions. Practice completing sections within time limits to avoid rushing.`,
      `Fifth, analyze your mistakes. Every wrong answer teaches you something. Keep an error log and review it weekly to identify patterns in your mistakes.`,
    ],
    keyTakeaways: [
      `Diagnose weak areas with a comprehensive diagnostic test`,
      `Use active recall and spaced repetition for better retention`,
      `Focus on high-yield topics that frequently appear in JAMB`,
      `Practice time management with timed mock examinations`,
    ],
    authorBio: `Mr. Tunde Bakare is the head of academic strategy at Edwardian Educational Consult. He has developed learning frameworks that have helped over 3,500 students improve their scores by an average of 80 points in JAMB.`,
  },
  {
    id: 6,
    title: 'From 32 to 280: Michael WAEC Journey',
    subtitle: 'Remarkable Comeback Story',
    type: 'success',
    description: 'After an initial poor performance, Michael used our intensive revision program to achieve an impressive 280 aggregate in WAEC 2026.',
    date: 'September 5, 2026',
    readTime: '9 min read',
    image: '/images/student-3.png',
    author: 'Mrs. Grace Okafor',
    category: 'Success Stories',
    studentsHelped: '1,500+ students',
    scoreImprovement: '248 point increase',
    icon: TrendingUp,
    fullContent: [
      `Michael entered our intensive WAEC revision program with an aggregate score of just 32. He had struggled with Mathematics, English Language, and Chemistry throughout his first term.`,
      `Our diagnostic assessment revealed that Michael had foundational knowledge gaps and poor study habits. We created a comprehensive intervention plan for him.`,
      `Over 12 weeks of intensive revision, Michael attended daily tutoring sessions, completed over 2,000 practice questions, and participated in weekly review classes.`,
      `The turning point came when Michael started using our adaptive learning platform. The system identified his weak areas and provided targeted practice questions that gradually increased in difficulty.`,
      `Michael also benefited from our peer study groups where he discussed difficult concepts with other students. This collaborative approach helped solidify his understanding.`,
      `In the final WAEC 2026 examination, Michael scored an impressive 280 aggregate, representing a 248-point improvement. He passed all subjects including Mathematics and English Language.`,
      `Michael success is celebrated across our community. He is now enrolled in our JAMB preparation program, aiming for law school admission.`,
    ],
    keyTakeaways: [
      `Consistent daily practice is key to dramatic score improvement`,
      `Adaptive learning platforms identify and target weak areas effectively`,
      `Peer study groups enhance understanding through discussion`,
      `Professional tutoring can transform even the weakest student into a top performer`,
    ],
    authorBio: `Mrs. Grace Okafor is the WAEC program coordinator at Edwardian Educational Consult with 15 years of experience. She specializes in turnaround cases and has helped over 500 students improve their WAEC scores by 100+ points.`,
  },
];

export default function StoryPage({ params }: { params: { id: string } }) {
  const storyId = parseInt(params.id);
  const [story, setStory] = useState<Story | null>(null);

  useEffect(() => {
    const found = stories.find((s) => s.id === storyId);
    setStory(found || null);
  }, [storyId]);

  useEffect(() => {
    document.title = story ? `${story.title} | Edwardian Stories` : 'Story | Edwardian Educational Consult';
  }, [story]);

  if (!story) {
    return (
      <div className="min-h-screen bg-primary-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <p className="text-primary-300 mb-6">The story you are looking for does not exist.</p>
          <Link href="/stories" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-400 text-primary-900 font-bold rounded-lg hover:bg-accent-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const Icon = story.icon;
  const typeColors: Record<string, string> = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    tutorial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    achievement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="min-h-screen bg-primary-800 text-white">
      <header className="border-b border-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/stories" className="inline-flex items-center gap-1 text-primary-300 hover:text-white text-sm transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${typeColors[story.type]}`}>
              <Icon className="w-3 h-3 inline mr-1" />
              {story.type}
            </span>
            <span className="text-xs text-primary-400">{story.category}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold font-heading mb-3">{story.title}</h1>
          <p className="text-xl text-primary-300 mb-4">{story.subtitle}</p>

          <div className="flex items-center gap-6 text-sm text-primary-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {story.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {story.readTime}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {story.author}
            </span>
          </div>
        </div>

        {story.image && (
          <div className="mb-8 aspect-video rounded-xl overflow-hidden border border-primary-700">
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-primary-200 leading-relaxed mb-6">
            {story.description}
          </p>

          <div className="space-y-6 mb-8">
            {story.fullContent.map((paragraph, idx) => (
              <p key={idx} className="text-primary-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {story.studentsHelped && (
            <div className="bg-primary-900/30 rounded-xl p-4 border border-primary-700 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <span className="font-bold text-white">{story.studentsHelped}</span>
                  <span className="text-sm text-primary-300"> students helped</span>
                </div>
              </div>
            </div>
          )}

          {story.scoreImprovement && (
            <div className="bg-primary-900/30 rounded-xl p-4 border border-primary-700 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <span className="font-bold text-white">{story.scoreImprovement}</span>
                  <span className="text-sm text-primary-300"> score improvement</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-primary-900/30 rounded-xl p-6 border border-primary-700 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Key Takeaways</h3>
            <ul className="space-y-2">
              {story.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-accent-400 mt-0.5">?</span>
                  <span className="text-primary-300">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-primary-700 pt-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary-300" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">{story.author}</h4>
                <p className="text-sm text-primary-300 leading-relaxed">
                  {story.authorBio}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-primary-700">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            More Stories
          </Link>

          <button
            onClick={() => navigator.share({ title: story.title, url: window.location.href })}
            className="flex items-center gap-2 px-4 py-2 text-primary-300 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share this story
          </button>
        </div>
      </article>
    </div>
  );
}
