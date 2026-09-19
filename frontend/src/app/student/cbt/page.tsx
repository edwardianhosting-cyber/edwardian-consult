'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Play, Clock, Award, ChevronRight, CheckCircle, XCircle, Trophy, TrendingUp, Calculator, X, AlertTriangle, BookOpen, Globe } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';

interface CBTQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  subject?: string;
  topic?: string;
  difficulty?: string;
  explanation?: string;
  correctOption?: number;
  groupType?: string;
  groupId?: string;
  groupOrder?: number;
  passage?: string;
  groupTitle?: string;
  groupInstructions?: string;
}

interface CBTData {
  examId: string;
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  questionCount: number;
  questions: CBTQuestion[];
}

interface CBTResult {
  resultId: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  totalQuestions: number;
  weakTopics: Record<string, { correct: number; total: number }>;
  userAnswers: Record<string, { selected: number; correct: boolean }>;
}

type CBTPhase = 'subjects' | 'instructions' | 'exam' | 'result';

export default function CBTPracticePage() {
  const [phase, setPhase] = useState<CBTPhase>('subjects');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [cbtData, setCbtData] = useState<CBTData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<CBTResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState<'PRACTICE' | 'MOCK' | 'ASSIGNMENT'>('PRACTICE');
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [examStarted, setExamStarted] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [userExamTypes, setUserExamTypes] = useState<string[]>([]);
  const [selectedExamCategory, setSelectedExamCategory] = useState<string>('JAMB');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmitted = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    fetchSubjects();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const examId = params.get('examId');
      const mode = params.get('mode');
      if (examId) {
        setExamType(mode === 'mock' ? 'MOCK' : mode === 'assignment' ? 'ASSIGNMENT' : 'PRACTICE');
        loadExam(examId);
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examStarted && !hasSubmitted.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted]);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const data = await api.getProfile();
        const user = (data as any).data || data;
        const examTypes = (user?.examTypes as string[]) || [];
        setUserExamTypes(examTypes);
        if (examTypes.length > 0) {
          const normalized = examTypes.map(t => t.toUpperCase());
          const preferred = normalized.find(t => ['JAMB', 'WAEC', 'NECO', 'POST_UTME', 'JUPEB', 'IJMB'].includes(t)) || normalized[0];
          setSelectedExamCategory(preferred);
        }
      } catch (error) {
        console.error('Failed to fetch user profile for exam types:', error);
      }
    }
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (phase === 'exam' && !showResult && examStarted) {
      if (prevPathnameRef.current !== pathname) {
        setPendingNavigation(() => () => {});
        setShowLeaveWarning(true);
      }
    }
    prevPathnameRef.current = pathname;
  }, [pathname, phase, showResult, examStarted]);

  useEffect(() => {
    if (phase === 'exam' && !showResult && examStarted) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[href]') as HTMLAnchorElement | null;
        if (link && link.href && !link.href.includes('#') && !link.href.includes(window.location.origin + window.location.pathname)) {
          e.preventDefault();
          const href = link.getAttribute('href');
          setPendingNavigation(() => () => {
            if (href) router.push(href);
          });
          setShowLeaveWarning(true);
        }
      };
      document.addEventListener('click', handleClick, true);
      return () => document.removeEventListener('click', handleClick, true);
    }
  }, [phase, showResult, examStarted, router]);

  useEffect(() => {
    if (phase === 'exam' && timeLeft > 0 && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitCBT();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, showResult]);

  useEffect(() => {
    if (phase !== 'exam' || !cbtData || showResult) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (!cbtData) return;
      const target = event.target as HTMLElement;
      const tagName = target.tagName;
      const isInput = tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInput) return;

      const key = event.key.toLowerCase();

      if (key === 'n' || key === 'arrowright') {
        event.preventDefault();
        setCurrentQuestion(prev => Math.min(cbtData.questions.length - 1, prev + 1));
        return;
      }

      if (key === 'p' || key === 'arrowleft') {
        event.preventDefault();
        setCurrentQuestion(prev => Math.max(0, prev - 1));
        return;
      }

      const optionMap: Record<string, number> = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };

      const optionIndex = optionMap[key];
      if (optionIndex !== undefined && cbtData.questions[currentQuestion]?.options?.[optionIndex]) {
        event.preventDefault();
        const currentQ = cbtData.questions[currentQuestion];
        selectAnswer(currentQ.id, optionIndex);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, cbtData, showResult, currentQuestion, answers]);

  function formatTime(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function getTimerColor() {
    if (timeLeft > 1800) return 'text-green-600';
    if (timeLeft > 600) return 'text-yellow-600';
    return 'text-red-600';
  }

  async function fetchSubjects() {
    try {
      const res = await api.getMySubjects();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setSubjects(list);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  }

  async function loadExam(examId: string) {
    setLoading(true);
    try {
      const res = await api.getExamById(examId);
      const examData = res.data as CBTData;
      setCbtData(examData);
      setTimeLeft(examData.duration * 60 || 3600);
      if (examData.subject) {
        setSelectedSubject(examData.subject);
      }
      setPhase('instructions');
    } catch (error) {
      console.error('Failed to load exam:', error);
      showError('Failed to load exam');
    } finally {
      setLoading(false);
    }
  }

  async function startCBT(subject: string) {
    setSelectedSubject(subject);
    setLoading(true);
    try {
      const questionCount = examType === 'PRACTICE' ? 50 : 50;
      const res = await api.generateCBT({
        subject: selectedSubject || subject,
        examType: selectedExamCategory,
        questionCount,
      });

      const data = res as any;
      setCbtData(data.data || data);
      setTimeLeft((data.data || data).duration * 60 || 3600);
      setPhase('instructions');
    } catch (error) {
      console.error('Failed to prepare CBT:', error);
      showError('Failed to prepare CBT. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function beginExam() {
    if (!cbtData) return;
    setExamStarted(true);
    setPhase('exam');
  }

  async function handleSubmitCBT() {
    if (!cbtData || hasSubmitted.current) return;

    hasSubmitted.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    setLoading(true);
    try {
      const res = await api.submitCBT(cbtData.examId, answers, examType);
      const data = res as any;
      setResult(data.data);
      setShowResult(true);
      setPhase('result');
      showSuccess('CBT submitted successfully');
    } catch (error) {
      console.error('Failed to submit CBT:', error);
      showError('Failed to submit. Please try again.');
      hasSubmitted.current = false;
    } finally {
      setLoading(false);
    }
  }

  function handleEndPractice() {
    setShowEndModal(true);
  }

  function confirmEndPractice() {
    setShowEndModal(false);
    handleSubmitCBT();
  }

  function confirmLeave() {
    setShowLeaveWarning(false);
    handleSubmitCBT();
  }

  function cancelLeave() {
    setShowLeaveWarning(false);
    setPendingNavigation(null);
  }

  function selectAnswer(questionId: string, optionIndex: number) {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }

  function getQuestionStatus(questionId: string, index: number) {
    const answered = answers[questionId] !== undefined;
    const isCurrent = index === currentQuestion;

    if (isCurrent) return 'current';
    if (answered) return 'answered';
    return 'unanswered';
  }

  function getQuestionColor(status: string) {
    switch (status) {
      case 'current': return 'bg-primary-600 text-white ring-2 ring-primary-300';
      case 'answered': return 'bg-green-100 text-green-700 border border-green-300';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  }

  async function viewCorrections() {
    if (!result || !cbtData) return;

    try {
      const res = await api.getCBTResult(result.resultId);
      const data = res.data;
      setCorrections(data.corrections || []);
    } catch (error) {
      console.error('Failed to load corrections:', error);
      const correctionsList = cbtData.questions.map((q, idx) => {
        const answer = result.userAnswers?.[q.id];
        return {
          questionNumber: idx + 1,
          question: q.text,
          options: q.options,
          correctOption: (q as any).correctOption ?? -1,
          userAnswer: answer?.selected ?? -1,
          isCorrect: answer?.correct ?? false,
          explanation: q.explanation,
          topic: q.topic,
          subject: q.subject,
          groupType: (q as any).groupType,
          groupId: (q as any).groupId,
          passage: (q as any).passage,
          groupTitle: (q as any).groupTitle,
          groupInstructions: (q as any).groupInstructions,
        };
      });
      setCorrections(correctionsList);
    }
    setShowCorrections(true);
  }

  function resetCBT() {
    setPhase('subjects');
    setCbtData(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setResult(null);
    setExamStarted(false);
    setTimeLeft(3600);
    setShowCorrections(false);
    setCorrections([]);
    setSelectedSubject(null);
    setPendingNavigation(null);
    setShowLeaveWarning(false);
    hasSubmitted.current = false;
  }

  // Calculator
  function handleCalcInput(value: string) {
    setCalcDisplay(prev => prev === '0' && !isNaN(Number(value)) ? value : prev + value);
  }

  function handleCalcOperator(nextOp: string) {
    setCalcDisplay(prev => `${prev}${nextOp}`);
  }

  function handleCalcClear() {
    setCalcDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }

  function handleCalcBackspace() {
    setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }

  function handleCalcEquals() {
    let expression = calcDisplay
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**');

    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (!Number.isFinite(result)) {
        setCalcDisplay('Error');
        return;
      }
      setCalcDisplay(String(Math.round(result * 1000000000) / 1000000000));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
    } catch {
      setCalcDisplay('Error');
    }
  }

  // Phase: Subjects Selection
  if (phase === 'subjects') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CBT Practice</h1>
          <p className="text-gray-600 mt-1">Practice with past questions and mock exams</p>
        </div>

        {userExamTypes.length > 0 && (
          <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Practice Exam Type</label>
            <div className="flex flex-wrap gap-2">
              {userExamTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedExamCategory(type.toUpperCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedExamCategory === type.toUpperCase()
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-1" />
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {subjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No subjects registered</p>
            <p className="text-gray-400 text-sm mt-1">Go to Courses to add subjects first</p>
            <Link href="/student/courses" className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-block">
              Add Subjects
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => startCBT(subject)}
                disabled={loading}
                className="bg-white rounded-xl border border-gray-100 p-6 text-left hover:shadow-lg hover:border-primary-200 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <Play className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{subject}</h3>
                      <p className="text-sm text-gray-500">50 questions • 60 minutes</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Link href="/student/results" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-primary-600" />
              <div>
                <p className="font-bold text-gray-900">View Results</p>
                <p className="text-sm text-gray-500">See your CBT history</p>
              </div>
            </div>
          </Link>
          <Link href="/student/performance" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-bold text-gray-900">Performance</p>
                <p className="text-sm text-gray-500">AI-powered analysis</p>
              </div>
            </div>
          </Link>
          <Link href="/student/leaderboard" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-bold text-gray-900">Leaderboard</p>
                <p className="text-sm text-gray-500">Compete with others</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Phase: Instructions
  if (phase === 'instructions' && selectedSubject && cbtData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSubject}</h2>
            <p className="text-gray-600">Read the instructions carefully before starting</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Exam Details</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Total Questions: <strong>{cbtData.questionCount}</strong></li>
                <li>• Duration: <strong>{cbtData.duration} minutes</strong></li>
                <li>• Subject: <strong>{selectedSubject}</strong></li>
                <li>• Type: <strong>{examType}</strong></li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Rules</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Do not refresh or leave the page during the exam</li>
                <li>• The timer cannot be paused once started</li>
                <li>• Leaving or closing the page will automatically submit your exam</li>
                <li>• Navigating away requires confirmation and will submit your attempt</li>
                <li>• Ensure you have a stable internet connection</li>
                <li>• You can navigate between questions using the question palette</li>
                <li>• Submit before time runs out to avoid auto-submission</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-2">💡 Tips</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Use the calculator if needed (available during exam)</li>
                <li>• Review your answers before submitting</li>
                <li>• Flag questions you want to review later</li>
                <li>• Keyboard shortcuts: N = Next, P = Previous, A/B/C/D = Select option</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('subjects'); setSelectedSubject(null); setCbtData(null); }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={beginExam}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Exam
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase: Exam in Progress
  if (phase === 'exam' && cbtData && !showResult) {
    const question = cbtData.questions[currentQuestion];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">{cbtData.title}</h2>
              <p className="text-sm text-gray-500">{selectedSubject}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 font-mono text-lg font-bold ${getTimerColor()}`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => setCalculatorOpen(!calculatorOpen)}
                className={`p-2 rounded-lg ${calculatorOpen ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Calculator"
              >
                <Calculator className="w-5 h-5" />
              </button>
              <button
                onClick={handleEndPractice}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                End Practice
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all"
                style={{ width: `${((currentQuestion + 1) / cbtData.questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {answeredCount}/{cbtData.questions.length} answered
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {cbtData.questions.map((q, index) => {
                  const status = getQuestionStatus(q.id, index);
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${getQuestionColor(status)}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary-600 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question {currentQuestion + 1} of {cbtData.questions.length}
                </span>
                {question.topic && (
                  <span className="ml-2 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                    {question.topic}
                  </span>
                )}
                {question.difficulty && (
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    question.difficulty === 'EASY' ? 'bg-green-50 text-green-700' :
                    question.difficulty === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {question.difficulty}
                  </span>
                )}
              </div>

              {(question.groupType === 'COMPREHENSION' || question.groupType === 'CLOZE') && question.passage && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  {question.groupTitle && (
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">{question.groupTitle}</h3>
                  )}
                  {question.groupInstructions && (
                    <p className="text-xs text-yellow-800 mb-2">{question.groupInstructions}</p>
                  )}
                  <div className="text-sm text-yellow-900 whitespace-pre-wrap leading-relaxed">{question.passage}</div>
                </div>
              )}

              <p className="text-lg text-gray-900 mb-6 leading-relaxed">{question.text}</p>

              {question.imageUrl && (
                <img src={question.imageUrl} alt="Question" className="mb-6 rounded-lg max-h-64 object-contain" />
              )}

              <div className="space-y-3">
                {question.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(question.id, index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[question.id] === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="font-bold text-gray-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-900">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculator */}
          {calculatorOpen && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Calculator</h3>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-right text-xl font-mono font-bold text-gray-900 break-all">
                    {calcDisplay}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <button onClick={() => handleCalcInput('(')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">(</button>
                  <button onClick={() => handleCalcInput(')')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">)</button>
                  <button onClick={() => handleCalcOperator('^')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">x^y</button>
                  <button onClick={handleCalcBackspace} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium">⌫</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={handleCalcClear} className="col-span-2 p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">C</button>
                  <button onClick={() => handleCalcOperator('/')} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">÷</button>
                  <button onClick={() => handleCalcOperator('*')} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">×</button>
                  <button onClick={() => handleCalcInput('7')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">7</button>
                  <button onClick={() => handleCalcInput('8')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">8</button>
                  <button onClick={() => handleCalcInput('9')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">9</button>
                  <button onClick={() => handleCalcOperator('-')} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">−</button>
                  <button onClick={() => handleCalcInput('4')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">4</button>
                  <button onClick={() => handleCalcInput('5')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">5</button>
                  <button onClick={() => handleCalcInput('6')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">6</button>
                  <button onClick={() => handleCalcOperator('+')} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">+</button>
                  <button onClick={() => handleCalcInput('1')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">1</button>
                  <button onClick={() => handleCalcInput('2')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">2</button>
                  <button onClick={() => handleCalcInput('3')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">3</button>
                  <button onClick={handleCalcEquals} className="row-span-2 p-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm font-medium">=</button>
                  <button onClick={() => handleCalcInput('0')} className="col-span-2 p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">0</button>
                  <button onClick={() => handleCalcInput('.')} className="p-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">.</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 font-medium"
          >
            Previous
          </button>
          {currentQuestion < cbtData.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitCBT}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>

        {/* End Practice Modal */}
        {showEndModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">End Practice?</h3>
                <p className="text-gray-600">Are you sure you want to end this practice? Your progress will be submitted.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Continue Practice
                </button>
                <button
                  onClick={confirmEndPractice}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                >
                  End Practice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Warning Modal */}
        {showLeaveWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Practice?</h3>
                <p className="text-gray-600">If you leave now, your practice will be automatically submitted. Do you want to continue?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cancelLeave}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Continue Practice
                </button>
                <button
                  onClick={confirmLeave}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Submitting...' : 'Leave & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Phase: Result
  if (phase === 'result' && result && cbtData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
            result.score >= 70 ? 'bg-green-100' : result.score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <span className={`text-4xl font-bold ${
              result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round(result.score)}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CBT Complete!</h2>
          <p className="text-gray-600 mb-6">{selectedSubject}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
              <p className="text-sm text-gray-500">Wrong</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-600">{result.skippedAnswers}</p>
              <p className="text-sm text-gray-500">Skipped</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetCBT}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Practice Again
            </button>
            <button
              onClick={viewCorrections}
              className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              View Corrections
            </button>
            <Link
              href="/student/results"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              View Results
            </Link>
          </div>
        </div>

        {/* Corrections Modal */}
        {showCorrections && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Corrections</h3>
                <button
                  onClick={() => setShowCorrections(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-600">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Correct Answer</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Your Wrong Answer</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block" /> Your Answer</span>
                <span className="flex items-center gap-1 text-gray-500">Not Answered</span>
              </div>

              <div className="space-y-4">
                {corrections.map((correction, idx) => {
                  const correctIndex = correction.correctOption ?? -1;
                  const userSelected = correction.userAnswer ?? -1;
                  const answered = userSelected >= 0;
                  const prevCorrection = idx > 0 ? corrections[idx - 1] : null;
                  const isNewGroup = correction.groupId && (!prevCorrection || prevCorrection.groupId !== correction.groupId);

                  return (
                    <div key={correction.questionNumber}>
                      {isNewGroup && correction.passage && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          {correction.groupTitle && (
                            <h3 className="text-sm font-semibold text-yellow-900 mb-2">{correction.groupTitle}</h3>
                          )}
                          {correction.groupInstructions && (
                            <p className="text-xs text-yellow-800 mb-2">{correction.groupInstructions}</p>
                          )}
                          <div className="text-sm text-yellow-900 whitespace-pre-wrap leading-relaxed">{correction.passage}</div>
                        </div>
                      )}
                      <div className="p-4 rounded-xl border border-gray-200 bg-white">
                        <p className="font-medium text-gray-900 mb-2">
                          Q{correction.questionNumber}: {correction.question}
                        </p>
                      <div className="space-y-1 mb-2">
                        {correction.options.map((option: string, optIndex: number) => {
                          const isCorrect = optIndex === correctIndex;
                          const isUserWrong = answered && optIndex === userSelected && !isCorrect;
                          const isUserAnswer = answered && optIndex === userSelected && isCorrect;

                          let className = 'text-sm p-2 rounded border ';
                          if (isCorrect) {
                            className += 'bg-green-50 border-green-300 text-green-800';
                          } else if (isUserWrong) {
                            className += 'bg-red-50 border-red-300 text-red-800';
                          } else if (isUserAnswer) {
                            className += 'bg-blue-50 border-blue-300 text-blue-800';
                          } else {
                            className += 'bg-gray-50 border-gray-200 text-gray-700';
                          }

                          return (
                            <div key={optIndex} className={className}>
                              <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>{' '}
                              {option}
                              {isCorrect && <span className="ml-2 text-xs font-semibold text-green-700">✓ Correct Answer</span>}
                              {isUserWrong && <span className="ml-2 text-xs font-semibold text-red-700">✕ Your Wrong Answer</span>}
                              {isUserAnswer && <span className="ml-2 text-xs font-semibold text-blue-700">Your Answer</span>}
                              {!answered && isCorrect && <span className="ml-2 text-xs font-semibold text-green-700">Correct Answer</span>}
                            </div>
                          );
                        })}
                      </div>
                      {!answered && (
                        <p className="text-xs text-gray-500 mb-2">Not Answered</p>
                      )}
                      {correction.explanation && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700"><strong>Explanation:</strong> {correction.explanation}</p>
                        </div>
                       )}
                     </div>
                   </div>
                   );
                 })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

