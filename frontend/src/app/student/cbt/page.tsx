'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Play, Clock, Award, ChevronRight, CheckCircle, XCircle, Trophy, TrendingUp, Calculator, X, AlertTriangle, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { API_BASE } from '@/lib/api';

interface CBTQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  topic?: string;
  difficulty?: string;
  explanation?: string;
  correctOption: number;
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmitted = useRef(false);

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
      const data = await api.getMySubjects();
      setSubjects(data && data.length > 0 ? data : []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  }

  async function loadExam(examId: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCbtData(data.data);
        setTimeLeft(data.data.duration * 60 || 3600);
        setPhase('instructions');
      }
    } catch (error) {
      console.error('Failed to load exam:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startCBT(subject: string) {
    setSelectedSubject(subject);
    setPhase('instructions');
  }

  async function beginExam() {
    setLoading(true);
    try {
      const questionCount = examType === 'PRACTICE' ? 50 : 50;
      const res = await api.generateCBT({
        subject: selectedSubject!,
        examType: 'JAMB',
        questionCount,
      });

      const data = res as any;
      setCbtData(data.data || data);
      setTimeLeft((data.data || data).duration * 60 || 3600);
      setExamStarted(true);
      setPhase('exam');
    } catch (error) {
      console.error('Failed to start CBT:', error);
      alert('Failed to start CBT. Please try again.');
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      console.error('Failed to submit CBT:', error);
      alert('Failed to submit. Please try again.');
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

  function viewCorrections() {
    if (!result || !cbtData) return;

    const correctionsList = cbtData.questions.map(q => {
      const userAnswer = answers[q.id];
      return {
        question: q.text,
        options: q.options,
        correctOption: q.correctOption,
        userAnswer,
        isCorrect: userAnswer === q.correctOption,
        explanation: q.explanation,
      };
    });

    setCorrections(correctionsList);
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
    hasSubmitted.current = false;
  }

  // Calculator
  function handleCalcInput(value: string) {
    if (waitingForOperand) {
      setCalcDisplay(value);
      setWaitingForOperand(false);
    } else {
      setCalcDisplay(prev => prev === '0' ? value : prev + value);
    }
  }

  function handleCalcOperator(nextOp: string) {
    const inputValue = parseFloat(calcDisplay);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      setCalcDisplay(String(result));
      setPrevValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  }

  function calculate(a: number, b: number, op: string): number {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  }

  function handleCalcEquals() {
    if (operator && prevValue !== null) {
      const result = calculate(prevValue, parseFloat(calcDisplay), operator);
      setCalcDisplay(String(result));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }

  function handleCalcClear() {
    setCalcDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }

  // Phase: Subjects Selection
  if (phase === 'subjects') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CBT Practice</h1>
          <p className="text-gray-600 mt-1">Practice with past questions and mock exams</p>
        </div>

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
  if (phase === 'instructions' && selectedSubject) {
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
                <li>• Total Questions: <strong>50</strong></li>
                <li>• Duration: <strong>60 minutes</strong></li>
                <li>• Subject: <strong>{selectedSubject}</strong></li>
                <li>• Type: <strong>{examType}</strong></li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Rules</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Do not refresh or leave the page during the exam</li>
                <li>• The timer cannot be paused once started</li>
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
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('subjects'); setSelectedSubject(null); }}
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
              <div className="space-y-4">
                {corrections.map((correction, index) => (
                  <div key={index} className={`p-4 rounded-xl border-2 ${correction.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <p className="font-medium text-gray-900 mb-2">Q{index + 1}: {correction.question}</p>
                    <div className="space-y-1 mb-2">
                      {correction.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className={`text-sm p-2 rounded ${
                          optIndex === correction.correctOption ? 'bg-green-100 text-green-800 font-medium' :
                          optIndex === correction.userAnswer && optIndex !== correction.correctOption ? 'bg-red-100 text-red-800' :
                          'text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === correction.correctOption && ' ✓'}
                          {optIndex === correction.userAnswer && optIndex !== correction.correctOption && ' ✗ (Your answer)'}
                        </div>
                      ))}
                    </div>
                    {correction.explanation && (
                      <div className="mt-2 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Explanation:</strong> {correction.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

