'use client';

import { Clock } from 'lucide-react';
import Link from 'next/link';

export default function CBTSimulatorCard() {
  return (
    <div className="hidden xl:block absolute top-1/2 right-4 xl:right-6 2xl:right-8 -translate-y-1/2 w-96 xl:w-[420px] z-30 pointer-events-none">
      <div className="relative w-full">
        <div className="absolute -inset-2 bg-gradient-to-br from-accent-500/15 via-transparent to-transparent blur-2xl opacity-40"></div>

        <div className="relative w-full max-w-md bg-primary-900/20 dark:bg-gray-900/25 backdrop-blur-xl border border-white/10 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">CBT SIMULATOR</h3>
            <div className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/40 rounded-full">
              <span className="text-[9px] font-bold text-blue-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                00:25:30
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="bg-gray-800/20 dark:bg-gray-800/30 border border-white/5 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-primary-300/80">Physics Question 25 of 50</span>
                <span className="text-xs text-primary-300/80">Score: 1/1</span>
              </div>

              <h4 className="text-sm font-bold text-white mb-3 leading-snug">
                What is the SI unit of electric current?
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 bg-gray-700/20 border border-gray-600/20 rounded-lg text-left px-3 hover:bg-gray-700/30 transition-colors">
                  <span className="text-xs text-gray-300">A.</span>
                  <span className="text-xs text-gray-300 ml-1">Volt</span>
                </button>
                <button className="py-2.5 bg-gray-700/20 border border-gray-600/20 rounded-lg text-left px-3 hover:bg-gray-700/30 transition-colors">
                  <span className="text-xs text-gray-300">B.</span>
                  <span className="text-xs text-gray-300 ml-1">Ampere</span>
                </button>
                <button className="py-2.5 bg-gray-700/20 border border-gray-600/20 rounded-lg text-left px-3 hover:bg-gray-700/30 transition-colors">
                  <span className="text-xs text-gray-300">C.</span>
                  <span className="text-xs text-gray-300 ml-1">Ohm</span>
                </button>
                <button className="py-2.5 bg-gray-700/20 border border-gray-600/20 rounded-lg text-left px-3 hover:bg-gray-700/30 transition-colors">
                  <span className="text-xs text-gray-300">D.</span>
                  <span className="text-xs text-gray-300 ml-1">Joule</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-blue-400">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Start exam</span>
              </div>
              <Link href="/register" className="text-white font-medium hover:text-primary-300 cursor-pointer pointer-events-auto">Get Started</Link>
            </div>
          </div>

          <button
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary-900/40 border border-white/10 hover:bg-primary-800/50 transition-colors flex items-center justify-center text-white pointer-events-auto cursor-pointer"
            aria-label="Next demo"
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



