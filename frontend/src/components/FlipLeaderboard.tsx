'use client';

import {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';

type LeaderboardPlayer = { id: string; name: string; score: number; correct?: number };

type FlipLeaderboardApi = {
  capturePositions: () => void;
};

type FlipLeaderboardProps = {
  players: LeaderboardPlayer[];
  currentCorrect: number | null;
  questionIndex: number;
  totalQuestions: number;
};

const FlipLeaderboard = forwardRef<FlipLeaderboardApi, FlipLeaderboardProps>(
  ({ players, currentCorrect, questionIndex, totalQuestions }, ref) => {
    const boardRef = useRef<HTMLUListElement>(null);
    const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());
    const prevPlayersRef = useRef<LeaderboardPlayer[]>([]);

    const capturePositions = useCallback(() => {
      if (!boardRef.current) return;
      const rects = new Map<string, DOMRect>();
      boardRef.current.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => {
        const id = el.getAttribute('data-id')!;
        rects.set(id, el.getBoundingClientRect());
      });
      prevRectsRef.current = rects;
    }, []);

    useImperativeHandle(ref, () => ({ capturePositions }));

    useEffect(() => {
      const board = boardRef.current;
      if (!board) return;

      const ranking = [...players].sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name)
      );

      // First mount: store and skip animation
      if (prevPlayersRef.current.length === 0) {
        prevPlayersRef.current = ranking;
        return;
      }

      const cards = board.querySelectorAll<HTMLElement>('[data-id]');
      const firstRects = prevRectsRef.current;

      // Reorder DOM to match new ranking
      ranking.forEach((player) => {
        const card = board.querySelector<HTMLElement>(`[data-id="${player.id}"]`);
        if (card) board.appendChild(card);
      });

      // Force reflow
      board.offsetHeight;

      const animations: HTMLElement[] = [];
      cards.forEach((card) => {
        const id = card.getAttribute('data-id')!;
        const oldRect = firstRects.get(id);
        const newRect = card.getBoundingClientRect();
        if (!oldRect) return;

        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;

        card.style.transition = 'none';
        card.style.transform = `translate(${dx}px, ${dy}px)`;
        card.classList.add('changed');
        animations.push(card);
      });

      requestAnimationFrame(() => {
        animations.forEach((card) => {
          card.style.transition =
            'transform 5000ms cubic-bezier(.22,.75,.2,1), background .35s ease, border-color .35s ease, box-shadow .35s ease';
          card.style.transform = 'translate(0,0)';
        });
      });

      const timeout = setTimeout(() => {
        board.querySelectorAll<HTMLElement>('[data-id]').forEach((card) => {
          card.classList.remove('changed');
          card.style.transition = '';
        });
      }, 5500);

      prevPlayersRef.current = ranking;

      return () => clearTimeout(timeout);
    }, [players]);

    const ranking = [...players].sort(
      (a, b) => b.score - a.score || a.name.localeCompare(b.name)
    );
    const prevScores = new Map(
      prevPlayersRef.current.map((p) => [p.id, p.score])
    );
    const prevRanks = new Map(
      prevPlayersRef.current.map((p, i) => [p.id, i + 1])
    );

    return (
      <div className="space-y-3">
        <p className="text-center text-lg font-bold text-black dark:text-white">
          Round over
        </p>
        {currentCorrect !== null && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Correct answer: Option {currentCorrect + 1}
          </p>
        )}
        <p className="text-center text-sm font-medium text-black dark:text-white">
          Leaderboard
        </p>
        <ul ref={boardRef} className="space-y-2">
          {ranking.map((player, index) => {
            const rank = index + 1;
            const delta = player.score - (prevScores.get(player.id) ?? player.score);
            const isLeader = rank === 1;
            const changed = prevRanks.get(player.id) !== rank;

            return (
              <li
                key={player.id}
                data-id={player.id}
                className={`relative grid grid-cols-[35px_44px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 rounded-xl min-h-[72px] border transition-all duration-300 ${isLeader
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-yellow-400 shadow-[0_0_18px_rgba(231,185,68,0.25)]'
                  : 'bg-white dark:bg-blue-800 border-gray-300 dark:border-gray-600 shadow-md'} text-black dark:text-white ${
                  changed ? 'ring-2 ring-yellow-400/50' : ''
                }`}
              >
                <div className="rank text-center font-black text-xl text-white">{rank}</div>
                <div className="avatar w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white/20 border border-white/30">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="details min-w-0">
                  <div className="name font-bold truncate text-sm">{player.name}</div>
                  <div className="status text-xs text-gray-600 dark:text-gray-400">
                    {player.correct ?? 0} correct answers
                  </div>
                </div>
                <div className="score-box text-right min-w-[64px]">
                  <div className="score font-black text-lg tabular-nums">
                    {player.score.toLocaleString()}
                  </div>
                  {delta !== 0 && (
                    <div className={`delta text-xs font-black mt-1 ${delta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {delta > 0 ? `+${delta}` : delta}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          Question {questionIndex} / {totalQuestions}
        </div>
      </div>
    );
  }
);

FlipLeaderboard.displayName = 'FlipLeaderboard';

export { FlipLeaderboard };
export type { FlipLeaderboardApi };
