'use client';
import { useEffect, useRef, useState } from 'react';
import { FlipLeaderboard } from '@/components/FlipLeaderboard';
import { FinalPodium } from '@/components/FinalPodium';
import type { FlipLeaderboardApi } from '@/components/FlipLeaderboard';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edwardian-consult-f8bo.onrender.com/';
const API_URL = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '').replace(/\/+$/, '') + '/';

export default function PlayQuiz() {
  const [step, setStep] = useState<'join'|'waiting'|'countdown'|'question'|'result'|'over'>('join');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [question, setQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [correct, setCorrect] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerPop, setTimerPop] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<any>(null);
  const pollRef = useRef<any>(null);
  const flipRef = useRef<FlipLeaderboardApi>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const fullName = (userData?.fullName || 'Student').toString().trim();
        const firstName = fullName.split(' ')[0] || 'Student';
        setName(firstName);
      }
    } catch {
      setName('Student');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollRoom = async () => {
    if (!pin) return;
    try {
      const res = await fetch(`${API_URL}api/live-quiz/room/${pin}`);
      const data = await res.json();
      if (!data.success) return;
      const { state, players: pl, questionIndex, countdownSeconds, current, timer, subjects } = data;
      setPlayers(pl || []);
      setQuestionIndex(questionIndex || 0);

      if (state === 'LOBBY') {
        setStep('waiting');
      } else if (state === 'COUNTDOWN') {
        setStep('countdown');
        setTimeLeft(countdownSeconds || 0);
        setQuestion(null);
      } else if (state === 'QUESTION') {
        setStep('question');
        setQuestion(current || null);
        setTimeLeft(timer || 60);
        setSelected(null);
        setRevealed(false);
        setAnimKey(k => k + 1);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft((x) => {
            if (x <= 1) { setTimerPop(false); return 0; }
            setTimerPop(p => !p); return x - 1;
          });
        }, 1000);
      } else if (state === 'RESULTS') {
        // Results handled via separate poll of leaderboard below
      } else if (state === 'GAME_OVER') {
        setStep('over');
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch {
      // silent
    }
  };

  const pollResults = async () => {
    if (!pin) return;
    try {
      const res = await fetch(`${API_URL}api/live-quiz/room/${pin}`);
      const data = await res.json();
      if (!data.success) return;
      if (data.state === 'RESULTS') {
        setStep('result');
        setCorrect(data.correct ?? null);
        setRevealed(true);
        setLeaderboard(data.leaderboard || []);
        setPlayers((data.leaderboard || []).map((p: any) => ({ id: p.id, name: p.name, score: p.score })));
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!pin) return;
    pollRef.current = setInterval(() => {
      pollRoom();
      pollResults();
    }, 2000);
    pollRoom();
    pollResults();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pin]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}api/live-quiz/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, name }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to join');
        return;
      }
      setPlayerId(data.playerId || '');
      setStep(data.state === 'QUESTION' ? 'question' : 'waiting');
      setPlayers(data.players || []);
      setError(null);
    } catch {
      setError('Failed to join. Check your connection.');
    }
  };

  const colors = ['#ff0808', '#0872d9', '#e5a900', '#198b08'];

  const submitAnswer = async (idx: number) => {
    if (!playerId) return;
    try {
      await fetch(`${API_URL}api/live-quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, answer: idx, playerId }),
      });
    } catch {
      // silent
    }
  };

  if (step === 'join') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-blue-950 flex items-center justify-center p-4 transition-colors duration-500">
        <div className="w-full max-w-sm bg-white dark:bg-blue-900 rounded-2xl shadow p-6 space-y-4 transition-all duration-500">
          <h1 className="text-2xl font-bold text-center text-black dark:text-white">Join Live Quiz</h1>
          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
          <form onSubmit={handleJoin} className="space-y-3">
            <input className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-black dark:text-white bg-white dark:bg-blue-900 transition-all duration-300 focus:scale-105 focus:shadow-lg" placeholder="Game PIN" value={pin} onChange={e => setPin(e.target.value)} required />
            <input className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-black dark:text-white bg-white dark:bg-blue-900 transition-all duration-300 focus:scale-105 focus:shadow-lg" placeholder="Your Name" value={name} readOnly />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Playing as: <span className="font-medium">{name}</span></p>
            <button className="w-full bg-indigo-600 text-white rounded-lg py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg" type="submit">Join</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-blue-950 p-4 flex items-center justify-center transition-colors duration-500">
      <div className="w-full max-w-sm quiz-card bg-white dark:bg-blue-900 rounded-2xl shadow-2xl p-5 space-y-3 transition-all duration-500">
        <h1 className="text-xl font-bold text-center text-black dark:text-white">Live Classroom Quiz</h1>
        <p className="text-sm text-center text-gray-600 dark:text-gray-300">PIN: <span className="font-mono font-bold">{pin}</span></p>

        {step === 'waiting' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-gray-600 dark:text-gray-300">Waiting for the host to start the game…</p>
            <p className="text-sm text-center font-medium">Participants: {players.length}</p>
            <ul className="space-y-1 w-full max-w-xs mx-auto">
              {players.map((p) => (
                <li key={p.id} className="text-black dark:text-white text-center px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-blue-800">{p.name}</li>
              ))}
            </ul>
          </div>
        )}

        {step === 'countdown' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-gray-600 dark:text-gray-300">Get ready! Quiz starts in</p>
            <div className={`text-6xl font-bold text-center text-indigo-600 dark:text-indigo-400 ${timerPop ? 'quiz-timer-pop' : ''}`}>{timeLeft}</div>
          </div>
        )}

        {step === 'question' && question && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Question {questionIndex} / 20</span>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-indigo-600 shadow-lg ${timerPop ? 'quiz-timer-pop' : ''}">{timeLeft}</div>
            </div>
            <div className="quiz-question animate-quiz-fade-in" key={animKey}>
              <h2 className="text-lg font-semibold text-center text-black dark:text-white">{question.text}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(question.options || []).map((o: any, i: number) => {
                const isSelected = selected === i;
                const isCorrect = i === correct;
                const base = `w-full min-h-[75px] border-2 rounded-xl flex items-center justify-between gap-2 px-3 py-3 font-bold text-center transition-all duration-300 quiz-option animate-quiz-fade-in ${i % 2 === 0 ? 'animate-delay-1' : 'animate-delay-2'}`;
                if (revealed && isCorrect) {
                  return (
                    <button key={`${animKey}-${i}`} className={`${base} bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-500 shadow-lg`} disabled={revealed} onClick={() => submitAnswer(i)}>
                      <span>{o}</span>
                      <span className="text-2xl opacity-100">✓</span>
                    </button>
                  );
                }
                if (revealed && isSelected && !isCorrect) {
                  return (
                    <button key={`${animKey}-${i}`} className={`${base} bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-500`} disabled={revealed} onClick={() => submitAnswer(i)}>
                      <span>{o}</span>
                      <span className="text-2xl opacity-100">✕</span>
                    </button>
                  );
                }
                return (
                  <button key={`${animKey}-${i}`} className={`${base} border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-blue-800 hover:scale-[1.02] hover:shadow-lg ${i === 0 ? 'border-red-500' : i === 1 ? 'border-blue-500' : i === 2 ? 'border-yellow-500' : 'border-green-500'}`} disabled={revealed || selected !== null} onClick={() => { setSelected(i); submitAnswer(i); }}>
                    {o}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 'result' && (
          <FlipLeaderboard ref={flipRef}
            players={leaderboard}
            currentCorrect={correct}
            questionIndex={questionIndex}
            totalQuestions={20}
          />
        )}

        {step === 'over' && (
          <FinalPodium players={leaderboard} onRestart={() => { setStep('waiting'); setLeaderboard([]); }} />
        )}
      </div>
    </div>
  );
}
