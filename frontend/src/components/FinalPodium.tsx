
'use client';

import { useEffect, useState } from 'react';

type FinalPlayer = {
  id: string;
  name: string;
  score: number;
  correct?: number;
};

type Phase =
  | 'intro'
  | 'countdown'
  | 'third'
  | 'second'
  | 'winnerRise'
  | 'winnerSpotlight'
  | 'winnerReveal'
  | 'final';

const rankStyles = {
  1: {
    height: 'h-[250px] sm:h-[290px]',
    medal: 'from-yellow-200 via-amber-400 to-yellow-600',
    podium: 'from-amber-300 via-yellow-500 to-amber-700',
    border: 'border-amber-300/60',
    glow: 'shadow-[0_0_55px_rgba(251,191,36,0.3)]',
    label: 'CHAMPION',
  },
  2: {
    height: 'h-[195px] sm:h-[225px]',
    medal: 'from-slate-100 via-slate-300 to-slate-500',
    podium: 'from-slate-300 via-slate-400 to-slate-600',
    border: 'border-slate-300/40',
    glow: '',
    label: '2ND PLACE',
  },
  3: {
    height: 'h-[155px] sm:h-[180px]',
    medal: 'from-orange-200 via-orange-400 to-amber-700',
    podium: 'from-orange-300 via-orange-500 to-orange-800',
    border: 'border-orange-300/40',
    glow: '',
    label: '3RD PLACE',
  },
};

export function FinalPodium({
  players,
  onRestart,
}: {
  players: FinalPlayer[];
  onRestart?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [countdown, setCountdown] = useState(3);
  const [replayKey, setReplayKey] = useState(0);

  const ranking = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  // First place always stays in the middle.
  const podiumPlayers = [
    { player: second, rank: 2 as const },
    { player: first, rank: 1 as const },
    { player: third, rank: 3 as const },
  ];

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const later = (callback: () => void, ms: number) => {
      const timer = setTimeout(() => {
        if (!cancelled) callback();
      }, ms);

      timers.push(timer);
    };

    setPhase('intro');
    setCountdown(3);

    // Opening pause, followed by the countdown.
    later(() => {
      setPhase('countdown');
      setCountdown(3);

      later(() => setCountdown(2), 1100);
      later(() => setCountdown(1), 2200);

      // Reveal third place.
      later(() => setPhase('third'), 3400);

      // Reveal second place.
      later(() => setPhase('second'), 7900);

      // Slowly raise the center podium.
      later(() => setPhase('winnerRise'), 12500);

      // Darken the stage and move the spotlight into position.
      later(() => setPhase('winnerSpotlight'), 16500);

      // Reveal the champion only after the spotlight sequence.
      later(() => setPhase('winnerReveal'), 22000);

      // Show the completed leaderboard.
      later(() => setPhase('final'), 25500);
    }, 1400);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [replayKey]);

  const podiumVisible = (rank: 1 | 2 | 3) => {
    if (phase === 'intro' || phase === 'countdown') return false;

    if (rank === 3) return true;

    if (rank === 2) {
      return [
        'second',
        'winnerRise',
        'winnerSpotlight',
        'winnerReveal',
        'final',
      ].includes(phase);
    }

    return [
      'winnerRise',
      'winnerSpotlight',
      'winnerReveal',
      'final',
    ].includes(phase);
  };

  const detailsVisible = (rank: 1 | 2 | 3) => {
    if (!podiumVisible(rank)) return false;

    // Keep the champion's name and score hidden until the final reveal.
    if (rank === 1) {
      return phase === 'winnerReveal' || phase === 'final';
    }

    if (rank === 2) {
      return [
        'second',
        'winnerRise',
        'winnerSpotlight',
        'winnerReveal',
        'final',
      ].includes(phase);
    }

    return true;
  };

  const replay = () => {
    setReplayKey((key) => key + 1);
    onRestart?.();
  };

  return (
    <div
      className="relative isolate mx-auto w-full max-w-[900px]
        overflow-hidden rounded-3xl border border-white/10
        bg-[#10091f] text-white
        shadow-[0_25px_100px_rgba(25,10,50,0.35)]"
    >
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_at_50%_45%,rgba(124,58,237,0.38),transparent_65%)]"
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10
          h-[360px] bg-gradient-to-b from-violet-500/10 to-transparent"
      />

      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10
          h-full w-1/2 -translate-x-1/2
          bg-gradient-to-b from-violet-300/10 via-purple-500/10 to-transparent"
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full
              bg-violet-200/70 animate-[float_5s_ease-in-out_infinite]"
            style={{
              left: `${(i * 41 + 7) % 96}%`,
              top: `${(i * 29 + 4) % 90}%`,
              animationDelay: `${(i % 7) * -0.7}s`,
              animationDuration: `${4 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      {/* Heading */}
      <header className="relative px-5 pb-2 pt-12 text-center sm:px-10 sm:pt-16">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full
            border border-violet-300/20 bg-violet-300/10 px-4 py-2
            text-[10px] font-bold uppercase tracking-[0.24em]
            text-violet-200 sm:text-xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
          {phase === 'final' ? 'Quiz completed' : 'The final results'}
        </div>

        <h2 className="text-3xl font-black leading-tight tracking-tight
          text-white sm:text-5xl lg:text-6xl">
          {phase === 'final' ? (
            'Final Leaderboard'
          ) : (
            <>
              Who&apos;s the{' '}
              <span className="bg-gradient-to-r from-amber-200
                via-yellow-400 to-orange-300 bg-clip-text text-transparent">
                Champion?
              </span>
            </>
          )}
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6
          text-violet-200/70 sm:text-base">
          Every point counted. Every answer mattered.
        </p>
      </header>

      {/* Suspense countdown */}
      {phase === 'countdown' && (
        <div
          className="absolute inset-0 z-40 flex items-center
            justify-center bg-[#10051f]/75 backdrop-blur-sm"
          aria-live="assertive"
          aria-label={`Countdown ${countdown}`}
        >
          <div
            key={countdown}
            className="text-center animate-[countPop_0.8s_ease_both]"
          >
            <p className="mb-3 text-xs font-bold uppercase
              tracking-[0.4em] text-violet-200">
              Get ready
            </p>

            <span
              className="block text-8xl font-black text-white
                drop-shadow-[0_0_35px_rgba(167,139,250,0.75)]
                sm:text-[160px]"
            >
              {countdown}
            </span>
          </div>
        </div>
      )}

      {/* Podium: second LEFT, champion CENTER, third RIGHT */}
      <section
        aria-label="Final player standings"
        className="relative mx-auto mt-10 w-full max-w-[760px]
          px-3 pb-8 sm:mt-12 sm:px-8 sm:pb-12"
      >
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-6">
          {podiumPlayers.map(({ player, rank }) => {
            const style = rankStyles[rank];
            const visible = podiumVisible(rank);
            const showDetails = detailsVisible(rank);

            return (
              <article
                key={player?.id ?? `empty-${rank}`}
                className={`relative flex min-w-0 flex-col items-center
                  transition-all duration-[1400ms]
                  ease-[cubic-bezier(0.16,0.8,0.25,1)]
                  ${visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-12 opacity-0'}
                  ${rank === 1 && phase === 'winnerRise'
                    ? 'scale-[1.04]'
                    : 'scale-100'}`}
              >
                {/* Player information */}
                <div
                  className={`mb-5 flex min-h-[166px] w-full
                    flex-col items-center justify-end text-center
                    transition-all duration-700
                    sm:mb-6 sm:min-h-[185px]
                    ${showDetails
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-5 opacity-0'}`}
                >
                  {player ? (
                    <>
                      <span
                        className={`mb-3 rounded-full border px-2 py-1
                          text-[8px] font-extrabold tracking-[0.14em]
                          sm:px-3 sm:text-[10px]
                          ${rank === 1
                            ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
                            : rank === 2
                              ? 'border-slate-300/20 bg-white/5 text-slate-200'
                              : 'border-orange-300/20 bg-orange-300/10 text-orange-200'}`}
                      >
                        {style.label}
                      </span>

                      <div
                        className={`mb-3 flex h-11 w-11 items-center
                          justify-center rounded-full border-2
                          border-white/50 bg-gradient-to-br
                          ${style.medal} text-xl font-black text-white
                          shadow-lg sm:h-14 sm:w-14 sm:text-2xl
                          ${rank === 1 ? 'shadow-amber-400/40' : ''}`}
                      >
                        {rank}
                      </div>

                      <h3
                        className="w-full break-words px-1 text-xs
                          font-extrabold leading-snug text-white
                          [overflow-wrap:anywhere] sm:text-base lg:text-lg"
                      >
                        {player.name}
                      </h3>

                      <p
                        className={`mt-2 text-xl font-black tabular-nums
                          sm:text-2xl lg:text-3xl
                          ${rank === 1 ? 'text-amber-300' : 'text-white'}`}
                      >
                        {player.score.toLocaleString()}
                      </p>

                      <p className="mt-1 text-[9px] text-violet-200/60 sm:text-xs">
                        {player.correct ?? 0} correct answers
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className="mb-3 flex h-11 w-11 items-center
                          justify-center rounded-full border border-white/10
                          bg-white/5 text-lg font-bold text-white/40 sm:h-14 sm:w-14"
                      >
                        {rank}
                      </div>

                      <p className="text-xs text-white/40 sm:text-sm">
                        No player
                      </p>
                    </>
                  )}
                </div>

                {/* Podium block */}
                <div
                  className={`relative flex w-full flex-col items-center
                    justify-start overflow-hidden rounded-t-2xl
                    border border-b-0 ${style.border}
                    bg-gradient-to-b ${style.podium}
                    ${style.height} ${rank === 1 ? style.glow : ''}
                    origin-bottom transition-transform
                    duration-[1800ms]
                    ease-[cubic-bezier(0.16,0.8,0.25,1)]
                    ${visible ? 'scale-y-100' : 'scale-y-0'}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0
                      bg-gradient-to-r from-white/15 via-transparent to-black/10"
                  />

                  <div className="relative mt-5 text-4xl font-black
                    text-white/80 sm:mt-7 sm:text-6xl">
                    {rank}
                  </div>

                  <div className="relative mt-2 text-[8px] font-bold
                    uppercase tracking-[0.2em] text-white/60 sm:text-[10px]">
                    {rank === 1 ? 'Winner' : `Place ${rank}`}
                  </div>

                  {rank === 1 && (
                    <div className="absolute bottom-5 text-2xl sm:bottom-7 sm:text-3xl">
                      🏆
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Podium base */}
        <div
          className="h-2 rounded-full bg-gradient-to-r
            from-orange-500/70 via-amber-300 to-orange-500/70
            opacity-70 shadow-[0_0_25px_rgba(251,191,36,0.2)]"
        />

        <p className="mt-5 text-center text-[9px] font-semibold
          uppercase tracking-[0.25em] text-violet-200/40 sm:text-xs">
          {phase === 'final'
            ? 'Official final standings'
            : 'The results are being revealed'}
        </p>
      </section>

      {/* Stage spotlight: appears BEFORE the champion's name */}
      {phase === 'winnerSpotlight' && (
        <div
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
          aria-hidden="true"
        >
          {/* Darken the stage */}
          <div
            className="absolute inset-0 bg-[#05020b]/80
              animate-[stageDarken_1.2s_ease-out_both]"
          />

          {/* Spotlight beam */}
          <div className="absolute inset-0 flex justify-center">
            <div
              className="absolute -top-[15%] h-[125%] w-[42%]
                origin-top bg-gradient-to-b from-white/75
                via-amber-100/30 to-transparent blur-md
                animate-[spotlightSweep_2.4s_cubic-bezier(.2,.7,.2,1)_both]"
              style={{
                clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)',
              }}
            />

            {/* Glowing pool of light */}
            <div
              className="absolute left-1/2 top-[66%] h-32 w-48
                -translate-x-1/2 -translate-y-1/2 rounded-full
                bg-amber-200/30 blur-3xl
                animate-[spotlightPulse_1.8s_ease-in-out_infinite]"
            />
          </div>

          {/* Keep the audience waiting */}
          <div
            className="absolute inset-x-3 top-[43%] text-center
              animate-[anticipation_1.2s_ease-out_both]"
          >
            <p className="text-[10px] font-black uppercase
              tracking-[0.45em] text-amber-100/90 sm:text-sm">
              The spotlight is on...
            </p>

            <p className="mt-4 text-2xl font-black tracking-widest
              text-white drop-shadow-[0_0_20px_rgba(255,220,130,0.8)]
              sm:text-4xl">
              WHO IS THE CHAMPION?
            </p>

            <div className="mx-auto mt-5 h-px w-24
              bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
          </div>
        </div>
      )}

      {/* Gold flash and champion announcement */}
      {phase === 'winnerReveal' && first && (
        <div
          className="pointer-events-none absolute inset-0 z-30
            flex items-center justify-center bg-white/10 px-3
            backdrop-blur-[2px] animate-[flash_0.7s_ease-out_forwards]"
        >
          <div
            className="max-w-full rounded-2xl border border-amber-200/70
              bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400
              px-5 py-4 text-center text-[#27123c]
              shadow-[0_0_70px_rgba(255,198,59,0.5)]
              animate-[bannerReveal_1s_cubic-bezier(.2,1.4,.4,1)_forwards]
              sm:px-10 sm:py-6"
          >
            <p className="mb-2 text-[10px] font-black uppercase
              tracking-[0.3em] sm:text-xs">
              The moment we&apos;ve been waiting for
            </p>

            <p className="text-xl font-black sm:text-3xl">
              🏆 Champion: {first.name}!
            </p>
          </div>
        </div>
      )}

      {/* Final leaderboard and replay */}
      {phase === 'final' && (
        <footer className="relative z-30 px-4 pb-10 text-center sm:pb-12">
          {first && (
            <p className="mb-5 text-sm text-violet-200/70">
              Congratulations to{' '}
              <span className="font-bold text-amber-300">{first.name}</span>
              {' '}for taking the top spot!
            </p>
          )}

          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center justify-center gap-3
              rounded-full border border-violet-300/30
              bg-violet-400/10 px-6 py-3 text-sm font-bold
              text-white transition duration-300
              hover:border-violet-200/60 hover:bg-violet-400/20
              sm:px-8 sm:py-4"
          >
            <span aria-hidden="true">↻</span>
            Replay reveal
          </button>
        </footer>
      )}

      <style jsx>{`
        @keyframes countPop {
          0% { opacity: 0; transform: scale(0.55); }
          60% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes float {
          0%, 100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(10px, -24px, 0);
            opacity: 1;
          }
        }

        @keyframes stageDarken {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spotlightSweep {
          0% {
            opacity: 0;
            transform: translateY(-8%) scaleX(0.25) rotate(-5deg);
          }
          55% {
            opacity: 1;
            transform: translateY(0) scaleX(1.12) rotate(2deg);
          }
          100% {
            opacity: 0.9;
            transform: translateY(0) scaleX(1) rotate(0deg);
          }
        }

        @keyframes spotlightPulse {
          0%, 100% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.85);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes anticipation {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 1; }
        }

        @keyframes bannerReveal {
          0% {
            opacity: 0;
            transform: translateY(25px) scale(0.7);
          }
          70% {
            opacity: 1;
            transform: translateY(0) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          :global(*) {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
