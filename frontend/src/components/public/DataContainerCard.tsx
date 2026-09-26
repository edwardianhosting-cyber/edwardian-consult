'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const schoolAdmissionRates: Record<string, { name: string; minScore: number; rate: (score: number) => number }> = {
  unilag: {
    name: 'University of Lagos (UNILAG)',
    minScore: 200,
    rate: (score: number) => {
      if (score < 200) return 5;
      if (score < 240) return 15 + (score - 200) * 2;
      if (score < 280) return 95 + (score - 240) * 0.5;
      return 115;
    },
  },
  ui: {
    name: 'University of Ibadan (UI)',
    minScore: 190,
    rate: (score: number) => {
      if (score < 190) return 0;
      if (score < 230) return 10 + (score - 190) * 1.5;
      if (score < 270) return 70 + (score - 230) * 1;
      return 110;
    },
  },
  oau: {
    name: 'Obafemi Awolowo University (OAU)',
    minScore: 200,
    rate: (score: number) => {
      if (score < 200) return 5;
      if (score < 240) return 20 + (score - 200) * 1.8;
      if (score < 280) return 92 + (score - 240) * 0.4;
      return 108;
    },
  },
  uniben: {
    name: 'University of Benin (UNIBEN)',
    minScore: 180,
    rate: (score: number) => {
      if (score < 180) return 10;
      if (score < 220) return 20 + (score - 180) * 1.2;
      if (score < 260) return 68 + (score - 220) * 0.8;
      return 100;
    },
  },
};

const schoolOptions = [
  { value: 'unilag', label: 'University of Lagos' },
  { value: 'ui', label: 'University of Ibadan' },
  { value: 'oau', label: 'Obafemi Awolowo University' },
  { value: 'uniben', label: 'University of Benin' },
];

export default function DataContainerCard() {
  const [selectedSchool, setSelectedSchool] = useState('unilag');
  const [jambScore, setJambScore] = useState(240);
  const school = schoolAdmissionRates[selectedSchool];
  const admissionRate = Math.min(99, Math.max(0, school.rate(jambScore)));
  const isEligible = jambScore >= school.minScore;

  return (
    <div className="hidden xl:block absolute top-1/2 right-4 xl:right-6 2xl:right-8 -translate-y-1/2 w-96 xl:w-[420px] z-30 pointer-events-none">
      <div className="relative w-full">
        <div className="absolute -inset-2 bg-gradient-to-br from-accent-500/15 via-transparent to-transparent blur-2xl opacity-40"></div>

        <div className="relative w-full max-w-md bg-primary-900/20 dark:bg-gray-900/25 backdrop-blur-xl border border-white/10 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ADMISSION PROBABILITY</h3>
            <span className="px-2 py-0.5 text-[10px] font-medium text-green-400 bg-green-500/20 border border-green-500/40 rounded-full">
              {isEligible ? 'ELIGIBLE' : 'CHECK SCORE'}
            </span>
          </div>

          <div className="p-4">
            <div className="bg-gray-800/20 dark:bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-primary-300/80">School</span>
                <span className="text-sm font-bold text-white">{school.name}</span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-xs text-primary-300/80 mb-1">
                    <span>JAMB Score: {jambScore}</span>
                    <span>{school.minScore} cut-off</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="350"
                    value={jambScore}
                    onChange={(e) => setJambScore(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-600/30 rounded-full accent-accent-400"
                  />
                  <div className="flex justify-between text-[10px] text-primary-400/50 mt-1">
                    <span>150</span>
                    <span>250</span>
                    <span>350</span>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <select
                      value={selectedSchool}
                      onChange={(e) => setSelectedSchool(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-700/20 border border-gray-600/30 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-accent-400/30 appearance-none"
                    >
                      {schoolOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-primary-800 text-gray-300">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                      ?
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-accent-400" />
                  <span className={`text-2xl font-bold ${
                    admissionRate >= 70 ? 'text-green-400' :
                    admissionRate >= 40 ? 'text-accent-400' :
                    'text-red-400'
                  }`}>
                    {Math.round(admissionRate)}%
                  </span>
                </div>
                <span className="text-xs text-primary-300/80 block">
                  Admission Probability
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-primary-300/80">Min. required: {school.minScore}</span>
              <span className="text-xs text-primary-400/50">Updated: Sept 26, 2026</span>
            </div>
          </div>

          <button
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary-900/40 border border-white/10 hover:bg-primary-800/50 transition-colors flex items-center justify-center text-white pointer-events-auto cursor-pointer"
            aria-label="Next insight"
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


