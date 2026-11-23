
import Link from 'next/link';
import { FinalPodium } from '@/components/FinalPodium';

export default function LiveQuizPreview() {
  const mockPlayers = [
    { id: 'p1', name: 'LovelyGoose', score: 8969, correct: 18 },
    { id: 'p2', name: 'SnowyCat', score: 8919, correct: 17 },
    { id: 'p3', name: 'HeroPanda', score: 8789, correct: 16 },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <nav className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2
              text-sm font-medium text-slate-600 transition
              hover:bg-white hover:text-indigo-600"
          >
            <span aria-hidden="true">←</span>
            Back to dashboard
          </Link>

          <span className="rounded-full border border-slate-200 bg-white
            px-3 py-1.5 text-xs font-medium text-slate-500">
            Preview mode
          </span>
        </nav>

        {/* Page heading */}
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em]
            text-indigo-600">
            Quiz experience
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900
            sm:text-4xl lg:text-5xl">
            Final Leaderboard
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600
            sm:text-lg">
            Preview the final results reveal, podium layout, and animation
            timing before launching your live quiz.
          </p>
        </header>

        {/* Preview information */}
        <section className="mb-6 flex flex-col gap-4 rounded-2xl
          border border-slate-200 bg-white p-5 shadow-sm
          sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Animation preview
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Sample participants · 3 players · Final standings
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full
            bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Test environment
          </span>
        </section>

        {/* Podium stage */}
        <section
          aria-label="Final leaderboard preview"
          className="overflow-hidden rounded-3xl border border-slate-200
            bg-white shadow-xl shadow-slate-200/50"
        >
          <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
            <h2 className="text-lg font-bold text-slate-900">
              Final results
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Watch the top three players take their positions.
            </p>
          </div>

          <div className="min-h-[600px] bg-gradient-to-b
            from-slate-50 via-white to-indigo-50/40
            px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
            <div className="mx-auto w-full max-w-4xl">
              <FinalPodium players={mockPlayers} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 flex flex-col gap-2 text-sm text-slate-500
          sm:flex-row sm:items-center sm:justify-between">
          <p>Preview only — no live quiz data is being used.</p>
          <p>Final leaderboard · UI testing</p>
        </footer>
      </div>
    </main>
  );
}
