'use client';

import { Zap, Keyboard, Globe } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Zap,
    text: 'Smart Question Engine',
    subtext: 'Adaptive learning picks questions tailored to your weak areas',
    badge: 'AI',
  },
  {
    icon: Keyboard,
    text: 'CBT Simulator',
    subtext: 'Practice in real exam conditions with timed sessions',
    badge: 'HOTKEY',
  },
  {
    icon: Globe,
    text: 'Results Analytics',
    subtext: 'Track performance across subjects and identify improvement areas',
    badge: 'SYNCED',
  },
];

export default function FeatureShowcaseCard() {
  return (
    <div className="hidden xl:block absolute top-1/2 right-4 xl:right-6 2xl:right-8 -translate-y-1/2 w-96 xl:w-[420px] z-30 pointer-events-none">
      <div className="relative w-full">
        <div className="absolute -inset-2 bg-gradient-to-br from-accent-500/20 via-primary-500/10 to-transparent blur-2xl opacity-50"></div>

        <div className="relative w-full max-w-md bg-primary-900/20 dark:bg-gray-900/25 backdrop-blur-xl border border-white/10 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">EDUCATION FEATURES</h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-green-400 bg-green-500/20 border border-green-500/40 rounded-full">
              NEW
            </span>
          </div>

          <div className="p-4 space-y-2">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-sm p-2.5 bg-primary-800/15 border border-white/5 rounded-xl"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <feature.icon className="w-4 h-4 text-accent-400" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-white block leading-tight">{feature.text}</span>
                  <span className="text-xs text-primary-300/80 block">{feature.subtext}</span>
                </div>
                <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-medium text-green-400 bg-green-500/20 border border-green-500/40 rounded-full">
                  {feature.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-primary-300/80">Updated: Sept 2026</span>
            <Link href="/stories/1" className="flex items-center gap-1 text-xs font-medium text-accent-400 hover:text-accent-300 pointer-events-auto cursor-pointer">
              Read Full Story
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <button
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary-900/40 border border-white/10 hover:bg-primary-800/50 transition-colors flex items-center justify-center text-white pointer-events-auto cursor-pointer"
            aria-label="Next feature"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}



