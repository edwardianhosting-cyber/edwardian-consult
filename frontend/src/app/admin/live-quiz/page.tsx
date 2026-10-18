'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import { FlipLeaderboard } from '@/components/FlipLeaderboard';
import { FinalPodium } from '@/components/FinalPodium';
import type { FlipLeaderboardApi } from '@/components/FlipLeaderboard';

export default function HostQuiz() {
  const [pin, setPin] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [question, setQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [counts, setCounts] = useState({ count: 0, total: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [correct, setCorrect] = useState<number | null>(null);
  const [step, setStep] = useState<'lobby'|'countdown'|'question'|'result'|'over'>('lobby');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const timerRef = useRef<any>(null);
  const flipRef = useRef<FlipLeaderboardApi>(null);
  const socket = useMemo(() => io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'), []);

  useEffect(() => {
    socket.emit('host:create');
    socket.emit('host:getSubjects');

    socket.on('connect', () => {
      socket.emit('host:getSubjects');
    });

    socket.on('room:created', (d: any) => {
      setPin(d.pin);
      setStep('lobby');
    });
    socket.on('room:players', (d: any) => setPlayers(d.players));
    socket.on('game:countdown', (d: any) => { setStep('countdown'); setCountdown(d.seconds); setQuestionTimeLeft(0); setQuestion(null); });
    socket.on('question:start', (d: any) => {
      setStep('question'); setQuestion(d.question); setQuestionIndex(d.questionIndex || 0); setCounts({ count: 0, total: players.length }); setQuestionTimeLeft(d.timer || 60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setQuestionTimeLeft((x) => (x > 1 ? x - 1 : 0));
      }, 1000);
    });
    socket.on('response:count', (d: any) => setCounts(d));
    socket.on('subjects:list', (d: any) => setAvailableSubjects(d.subjects || []));
    socket.on('subjects:set', (d: any) => setSubjects(d.subjects || []));
    socket.on('question:result', (d: any) => {
      if (timerRef.current) clearInterval(timerRef.current);
      flipRef.current?.capturePositions();
      setStep('result'); setCorrect(d.correct); setLeaderboard(d.leaderboard);
      autoNext();
    });
    socket.on('game:over', (d: any) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('over'); setLeaderboard(d.leaderboard);
    });
    socket.on('error', () => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      socket.off('room:created').off('room:rejoined').off('room:players').off('game:countdown').off('question:start').off('response:count').off('subjects:set').off('question:result').off('game:over').off('error');
    };
  }, []);

  const autoNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let secs = 5;
    timerRef.current = setInterval(() => {
      secs -= 1;
      if (secs <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
    }, 1000);
  };

  const addSubject = () => {};
  const removeSubject = (s: string) => {};

  const startGame = () => {
    if (!pin || players.length === 0) return;
    socket.emit('host:startNext', { pin });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-blue-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {step === 'lobby' && (
          <div className="flex flex-col items-center gap-4 bg-white dark:bg-blue-900 shadow rounded p-6 border-2 border-gray-300 dark:border-gray-600 w-full max-w-md mx-auto transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
            <h1 className="text-2xl font-bold text-black dark:text-white">Live Classroom Quiz Host</h1>
            <span className="text-xl font-mono font-bold text-black dark:text-white px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow bg-white dark:bg-blue-900">PIN: {pin}</span>

            <div className="w-full space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Select subjects</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-blue-800">
                {availableSubjects.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full">No subjects found</p>
                ) : (
                  availableSubjects.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        checked={subjects.includes(s)}
                        onChange={() => {
                          const next = subjects.includes(s) ? subjects.filter((x) => x !== s) : [...subjects, s];
                          setSubjects(next);
                          socket.emit('host:setSubjects', { pin, subjects: next });
                        }}
                      />
                      {s}
                    </label>
                  )
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select one or more subjects; random questions will be drawn from them.</p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">Participants: {players.length}</p>
            <ul className="space-y-1 w-full">
              {players.map((p) => (
                <li key={p.id} className="flex justify-between px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-blue-800 text-black dark:text-white"><span>{p.name}</span><span className="font-bold">{p.score}</span></li>
              ))}
            </ul>
            <button className="bg-indigo-600 text-white rounded-lg px-6 py-2 font-semibold shadow hover:shadow-lg" disabled={players.length === 0} onClick={startGame}>Start Game</button>
          </div>
        )}

        {step === 'countdown' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-blue-900 shadow rounded p-6 border-2 border-gray-300 dark:border-gray-600 w-full max-w-md mx-auto transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
            <h2 className="text-xl font-bold text-black dark:text-white mb-4">Get Ready!</h2>
            <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">{countdown}</div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Quiz starting…</p>
          </div>
        )}

        {step === 'question' && question && (
          <div className="bg-white dark:bg-blue-900 shadow rounded p-6 border-2 border-gray-300 dark:border-gray-600 w-full max-w-md mx-auto transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">PIN: {pin}</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Question {questionIndex} / 20</span>
            </div>
            <h2 className="text-lg font-semibold text-center mb-4">{question.text}</h2>
            <div className="text-center">
              <span className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{questionTimeLeft}s</span>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Responses: {counts.count}/{counts.total}</p>
            </div>
          </div>
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
          <FinalPodium players={leaderboard} onRestart={() => { setStep('lobby'); setLeaderboard([]); setPin(''); }} />
        )}
      </div>
    </div>
  );
}