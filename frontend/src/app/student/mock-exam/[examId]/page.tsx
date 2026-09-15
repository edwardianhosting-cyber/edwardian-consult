'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, API_BASE } from '@/lib/api';
import { showError } from '@/lib/toast';
import { Play, Clock, Award, ChevronRight, CheckCircle, XCircle, Trophy, TrendingUp, Calculator, X, AlertTriangle, BookOpen, Globe } from 'lucide-react';

interface MockQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  topic?: string;
  explanation?: string;
  subject: string;
}

interface MockExamData {
  examId: string;
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  questionCount: number;
  questions: MockQuestion[];
}

type CBTPhase = 'instructions' | 'exam' | 'result';

export default function MockExamPage() {
  const params = useParams();
  const examId = params.examId as string;

  const [phase, setPhase] = useState<CBTPhase>('instructions');
  const [cbtData, setCbtData] = useState<MockExamData | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectQuestions, setSubjectQuestions] = useState<MockQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [result, setResult] = useState<any>(null);
  const [examStarted, setExamStarted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmitted = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (examId) {
      loadExam(examId);
    }
  }, [examId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'exam' && !showSubmitModal && timeLeft > 0) {
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
  }, [phase, showSubmitModal]);

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

  async function loadExam(examId: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        const examData = data.data as MockExamData;
        setCbtData(examData);
        setTimeLeft(examData.duration * 60 || 3600);

        const subjectSet = new Set<string>();
        examData.questions.forEach(q => subjectSet.add(q.subject));
        const subjectList = Array.from(subjectSet);
        setSubjects(subjectList);
        if (subjectList.length > 0) {
          setSelectedSubject(subjectList[0]);
        }
      } else {
        showError('Failed to load mock exam');
      }
    } catch (error) {
      console.error('Failed to load exam:', error);
      showError('Failed to load mock exam');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cbtData && selectedSubject) {
      const filtered = cbtData.questions.filter(q => q.subject === selectedSubject);
      setSubjectQuestions(filtered);
      setCurrentQuestion(0);
    }
  }, [selectedSubject, cbtData]);

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

  async function beginExam() {
    setLoading(true);
    try {
      setExamStarted(true);
      setPhase('exam');
    } catch (error) {
      console.error('Failed to start exam:', error);
      showError('Failed to start exam');
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
      const res = await api.submitCBT(cbtData.examId, answers, 'MOCK');
      const data = res as any;
      setResult(data.data);
      setShowSubmitModal(false);
      setPhase('result');
    } catch (error) {
      console.error('Failed to submit exam:', error);
      showError('Failed to submit. Please try again.');
      hasSubmitted.current = false;
    } finally {
      setLoading(false);
    }
  }

  function confirmSubmit() {
    setShowSubmitModal(false);
    handleSubmitCBT();
  }

  function resetExam() {
    setPhase('instructions');
    setCbtData(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setExamStarted(false);
    setTimeLeft(3600);
    setShowSubmitModal(false);
    setShowLeaveWarning(false);
    setCalculatorOpen(false);
    setCalcDisplay('0');
    setSubjects([]);
    setSelectedSubject(null);
    setSubjectQuestions([]);
    hasSubmitted.current = false;
  }

  // Calculator functions
  function handleCalcInput(value: string) {
    setCalcDisplay(prev => prev === '0' && !isNaN(Number(value)) ? value : prev + value);
  }

  function handleCalcFunction(fn: string) {
    setCalcDisplay(prev => prev === '0' ? `${fn}(` : `${prev}${fn}(`);
  }

  function handleCalcConstant(value: string) {
    setCalcDisplay(prev => prev === '0' ? value : `${prev}${value}`);
  }

  function handleCalcOperator(nextOp: string) {
    setCalcDisplay(prev => `${prev}${nextOp}`);
  }

  function handleCalcClear() {
    setCalcDisplay('0');
  }

  function handleCalcBackspace() {
    setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }

  function handleCalcEquals() {
    let expression = calcDisplay
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e(?![A-Za-z])/g, 'Math.E')
      .replace(/\^/g, '**');

    expression = expression.replace(/\bsin\(([^)]+)\)/g, (_, args) => `Math.sin((${args})*Math.PI/180)`);
    expression = expression.replace(/\bcos\(([^)]+)\)/g, (_, args) => `Math.cos((${args})*Math.PI/180)`);
    expression = expression.replace(/\btan\(([^)]+)\)/g, (_, args) => `Math.tan((${args})*Math.PI/180)`);
    expression = expression.replace(/\bsqrt\(/g, 'Math.sqrt(');
    expression = expression.replace(/\blog\(/g, 'Math.log10(');
    expression = expression.replace(/\bln\(/g, 'Math.log(');

    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%MathsincostqrtlgtenPI\s]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (!Number.isFinite(result)) {
        setCalcDisplay('Error');
        return;
      }
      setCalcDisplay(String(Math.round(result * 1000000000) / 1000000000));
    } catch {
      setCalcDisplay('Error');
    }
  }

  // Phase: Instructions
  if (phase === 'instructions' && cbtData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{cbtData.title}</h2>
            <p className="text-gray-600">Read the instructions carefully before starting</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Exam Details</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Total Questions: <strong>{cbtData.questionCount}</strong></li>
                <li>• Duration: <strong>{cbtData.duration} minutes</strong></li>
                <li>• Subjects: <strong>{subjects.join(', ')}</strong></li>
                <li>• Type: <strong>MOCK EXAM</strong></li>
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
                <li>• You can switch between subjects using the subject tabs</li>
                <li>• Submit before time runs out to avoid auto-submission</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-2">💡 Tips</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Use the calculator if needed (available during exam)</li>
                <li>• Review your answers before submitting</li>
                <li>• Switch between subjects to manage your time</li>
                <li>• Flag questions you want to review later</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/student/mock')}
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
  if (phase === 'exam' && cbtData && !showSubmitModal) {
    const question = subjectQuestions[currentQuestion];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-7xl mx-auto">
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
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Subject Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubject === subject
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all"
                style={{ width: `${((currentQuestion + 1) / subjectQuestions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {currentQuestion + 1}/{subjectQuestions.length} answered
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Questions - {selectedSubject}</h3>
              <div className="grid grid-cols-5 gap-2">
                {subjectQuestions.map((q, index) => {
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
                  Question {currentQuestion + 1} of {subjectQuestions.length}
                </span>
                {question.topic && (
                  <span className="ml-2 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                    {question.topic}
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
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <button onClick={() => handleCalcFunction('sin')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">sin</button>
                  <button onClick={() => handleCalcFunction('cos')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">cos</button>
                  <button onClick={() => handleCalcFunction('tan')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">tan</button>
                  <button onClick={() => handleCalcOperator('^')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">x^y</button>
                  <button onClick={() => handleCalcFunction('sqrt')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">√</button>
                  <button onClick={() => handleCalcFunction('log')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">log</button>
                  <button onClick={() => handleCalcFunction('ln')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">ln</button>
                  <button onClick={() => handleCalcConstant('Math.PI')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">π</button>
                  <button onClick={() => handleCalcConstant('Math.E')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">e</button>
                  <button onClick={() => handleCalcInput('(')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">(</button>
                  <button onClick={() => handleCalcInput(')')} className="p-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-xs font-medium">)</button>
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
          {currentQuestion < subjectQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Mock Exam?</h3>
                <p className="text-gray-600">
                  You are about to submit your mock exam. This action cannot be undone.
                </p>
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-bold text-gray-900">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Unanswered:</span>
                    <span className="font-bold text-gray-900">{subjectQuestions.length - answeredCount}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Continue Exam
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Submitting...' : 'Submit Exam'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Phase: Result
  if (phase === 'result' && result) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mock Exam Complete!</h2>
          <p className="text-gray-600 mb-6">{cbtData?.title}</p>

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
              onClick={resetExam}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Take Another Mock
            </button>
            <button
              onClick={() => router.push('/student/mock-results')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              View All Mock Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
