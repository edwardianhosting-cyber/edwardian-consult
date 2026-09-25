'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, API_BASE } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import { Play, Clock, Award, ChevronRight, CheckCircle, XCircle, Trophy, TrendingUp, Calculator, X, AlertTriangle, BookOpen, Globe } from 'lucide-react';

interface MockQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  topic?: string;
  explanation?: string;
  subject: string;
  groupType?: string;
  groupId?: string;
  groupOrder?: number;
  passage?: string;
  groupTitle?: string;
  groupInstructions?: string;
}

interface MockExamData {
  examId: string;
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  questionCount: number;
  questionsPerSubject?: number;
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
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [result, setResult] = useState<any>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmitted = useRef(false);
  const router = useRouter();

  const getDraftKey = () => `mock-exam-draft-${examId}`;

  function saveDraft() {
    if (!cbtData || phase !== 'exam' || hasSubmitted.current) return;
    try {
      const draft = {
        answers,
        timeLeft,
        currentQuestion,
        selectedSubject,
        phase: 'exam',
        examStarted: true,
        cbtData,
        savedAt: Date.now(),
      };
      localStorage.setItem(getDraftKey(), JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to save exam draft:', err);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(getDraftKey());
    } catch (err) {
      console.error('Failed to clear exam draft:', err);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(getDraftKey());
      if (!raw) return null;
      return JSON.parse(raw) as any;
    } catch (err) {
      console.error('Failed to load exam draft:', err);
      return null;
    }
  }

  function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        setShowFullscreenPrompt(true);
      });
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function handleTabSwitch() {
    if (phase === 'exam' && !hasSubmitted.current && document.visibilityState === 'hidden') {
      setShowTabSwitchWarning(true);
      setTabSwitchCount(prev => prev + 1);
    }
  }

  function handleTabReturn() {
    if (document.visibilityState === 'visible') {
      setShowTabSwitchWarning(false);
    }
  }

  async function autoSubmitFromDraft() {
    const draft = loadDraft();
    if (!draft || !draft.cbtData || !draft.answers) {
      setShowAutoSubmitModal(false);
      return;
    }

    setLoading(true);
    setShowAutoSubmitModal(false);
    try {
      const res = await api.submitCBT(draft.cbtData.examId, draft.answers, 'MOCK', examId);
      const data = (res as any)?.data || res || {};
      setResult(data);
      setPhase('result');
      clearDraft();
      showSuccess('Exam auto-submitted due to page refresh');
    } catch (error) {
      console.error('Failed to auto-submit exam:', error);
      showError('Failed to auto-submit. Please contact support.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (examId) {
      loadExam(examId);
    }
  }, [examId]);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.cbtData && draft.phase === 'exam') {
      setShowAutoSubmitModal(true);
    }
  }, [examId]);

  useEffect(() => {
    if (phase !== 'exam' || !cbtData || showSubmitModal) return;

    const interval = setInterval(() => {
      saveDraft();
    }, 10000);

    return () => clearInterval(interval);
  }, [phase, cbtData, showSubmitModal]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (phase === 'exam' && !hasSubmitted.current) {
        saveDraft();
        event.preventDefault();
        event.returnValue = 'Your exam will be automatically submitted if you leave or refresh. Are you sure you want to continue?';
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase, answers, timeLeft, currentQuestion, selectedSubject, cbtData]);

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

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        handleTabSwitch();
      } else {
        handleTabReturn();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [phase]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (phase !== 'exam' || !cbtData || showSubmitModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const tagName = target.tagName;
      const isInput = tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInput) return;

      const key = event.key.toLowerCase();

      if (key === 'n' || key === 'arrowright') {
        event.preventDefault();
        setCurrentQuestion(prev => Math.min(subjectQuestions.length - 1, prev + 1));
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
      if (optionIndex !== undefined && subjectQuestions[currentQuestion]?.options?.[optionIndex]) {
        event.preventDefault();
        const currentQ = subjectQuestions[currentQuestion];
        selectAnswer(currentQ.id, optionIndex);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, cbtData, showSubmitModal, subjectQuestions, currentQuestion, answers]);

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
    if (examStarted) return;
    setLoading(true);
    try {
      const [examRes, statusRes] = await Promise.all([
        api.getExamById(examId),
        api.getMockRetakeStatus(examId),
      ]);
      const examData = (examRes as any).data || examRes;
      setCbtData(examData);
      setTimeLeft(examData.duration * 60 || 3600);

      const subjectSet = new Set<string>();
      examData.questions.forEach((q: any) => subjectSet.add(q.subject));
      const subjectList = Array.from(subjectSet);
      setSubjects(subjectList);
      if (subjectList.length > 0) {
        setSelectedSubject(subjectList[0]);
      }

      const retakeStatus = (statusRes as any).data || statusRes;
      if (retakeStatus && !retakeStatus.canRetake) {
        showError('You have already taken this mock exam. Retake requires admin approval.');
      }

      try {
        const profileRes = await api.getProfile();
        const profile = (profileRes as any).data || profileRes;
        const jambSubjects = (profile?.jambSubjects as string[]) || [];
        const olevelResults = (profile?.olevelResults as string[]) || [];
        const userExamTypes = (profile?.examTypes as string[]) || [];
        const primaryExamType = userExamTypes[0]?.toUpperCase();

        let registeredSubjects: string[] = [];
        if (primaryExamType === 'WAEC' || primaryExamType === 'NECO') {
          registeredSubjects = olevelResults;
        } else {
          registeredSubjects = jambSubjects;
        }

        if (registeredSubjects.length > 0) {
          setSubjects(registeredSubjects);
          setSelectedSubject(registeredSubjects[0]);
        }
      } catch (profileError) {
        console.error('Failed to load student profile for subjects:', profileError);
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

  function getQuestionSectionLabel(question: MockQuestion): string {
    if (question.groupType === 'COMPREHENSION') return 'Comprehension';
    if (question.groupType === 'CLOZE') return 'Cloze Test';
    return 'Questions';
  }

  function isFirstInSection(index: number): boolean {
    if (index === 0) return true;
    const current = subjectQuestions[index];
    const previous = subjectQuestions[index - 1];
    if (!current || !previous) return true;
    if (current.groupType !== previous.groupType) return true;
    if (current.groupType === 'COMPREHENSION' || current.groupType === 'CLOZE') {
      return current.groupId !== previous.groupId;
    }
    return false;
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
      const statusRes = await api.getMockRetakeStatus(examId);
      const status = (statusRes as any).data || statusRes;

      if (status && !status.canRetake) {
        showError('You have already taken this mock exam. Retake requires admin approval.');
        return;
      }

      const res = await api.startMockExamAttempt(examId);
      const attemptData = (res as any).data || res;
      setCbtData(attemptData as MockExamData);
      setTimeLeft((attemptData as MockExamData).duration * 60 || 3600);

      const subjectSet = new Set<string>();
      (attemptData as MockExamData).questions.forEach((q: MockQuestion) => subjectSet.add(q.subject));
      const subjectList = Array.from(subjectSet);
      setSubjects(subjectList);

      const firstSubject = subjectList.length > 0 ? subjectList[0] : null;
      setSelectedSubject(firstSubject);

      const filtered = firstSubject ? (attemptData as MockExamData).questions.filter(q => q.subject === firstSubject) : [];
      setSubjectQuestions(filtered);
      setCurrentQuestion(0);

      setExamStarted(true);
      setPhase('exam');
      hasSubmitted.current = false;
      setTimeout(() => enterFullscreen(), 500);
    } catch (error: any) {
      console.error('Failed to start mock exam:', error);
      const message = error?.message || 'Failed to start mock exam. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitCBT() {
    if (!cbtData || hasSubmitted.current) return;

    hasSubmitted.current = true;
    setSubmitError(null);
    if (timerRef.current) clearInterval(timerRef.current);
    exitFullscreen();

    setLoading(true);
    try {
      const res = await api.submitCBT(cbtData.examId, answers, 'MOCK', examId);
      const data = (res as any)?.data || res || {};
      setResult(data);
      setShowSubmitModal(false);
      setPhase('result');
      clearDraft();
      showSuccess('Mock exam submitted successfully');
    } catch (error) {
      console.error('Failed to submit exam:', error);
      showError('Failed to submit. Please try again.');
      setSubmitError('Failed to submit your mock exam. Please check your connection and try again.');
      hasSubmitted.current = false;
    } finally {
      setLoading(false);
    }
  }

  function confirmSubmit() {
    setShowSubmitModal(false);
    setSubmitError(null);
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
    setSubmitError(null);
    hasSubmitted.current = false;
    clearDraft();
    exitFullscreen();
  }

  // Calculator functions
  function handleCalcInput(value: string) {
    setCalcDisplay(prev => prev === '0' && !isNaN(Number(value)) ? value : prev + value);
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
      .replace(/\^/g, '**');

    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
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
    const totalQuestions = cbtData.questionsPerSubject && subjects.length > 0
      ? cbtData.questionsPerSubject * subjects.length
      : cbtData.questionCount;
    const duration = cbtData.duration;

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
                <li>• Total Questions: <strong>{totalQuestions}</strong></li>
                <li>• Duration: <strong>{duration} minutes</strong></li>
                <li>• Subjects: <strong>{subjects.join(', ')}</strong></li>
                <li>• Type: <strong>MOCK EXAM</strong></li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Rules</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• This exam runs in <strong>full-screen mode</strong> — you cannot exit full-screen during the exam</li>
                <li>• <strong>Do not switch tabs or windows</strong> — switching tabs will trigger a warning and may auto-submit your exam</li>
                <li>• <strong>Do not refresh or close the page</strong> — refreshing will automatically submit your exam</li>
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
                <li>• Keyboard shortcuts: N = Next, P = Previous, A/B/C/D = Select option</li>
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
  if (phase === 'exam' && cbtData) {
    const question = subjectQuestions[currentQuestion];
    const answeredCount = Object.keys(answers).length;

    if (!question || subjectQuestions.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
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

        {/* Question Area */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question {currentQuestion + 1} of {subjectQuestions.length}
              </span>
              {question.topic && (
                <span className="ml-2 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                  {question.topic}
                </span>
              )}
              {isFirstInSection(currentQuestion) && (
                <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {getQuestionSectionLabel(question)}
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

        {/* Calculator */}
        {calculatorOpen && (
            <div className="mb-6">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
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

        {/* Question Palette */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Questions - {selectedSubject}</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
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

  // Tab Switch Warning Overlay
  if (showTabSwitchWarning) {
    return (
      <div className="fixed inset-0 bg-red-50/95 flex items-center justify-center z-50 p-4" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">⚠️ Tab Switch Detected</h3>
          <p className="text-gray-600 mb-4">
            You have switched tabs <span className="font-bold text-red-600">{tabSwitchCount}</span> time{tabSwitchCount > 1 ? 's' : ''}.
          </p>
          <p className="text-gray-600 mb-6">
            Switching tabs during the exam is not allowed. Return to this tab immediately.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm">
            <p className="font-semibold text-red-900 mb-1">Security Notice:</p>
            <p className="text-red-700">Continuing to switch tabs may result in your exam being automatically submitted.</p>
          </div>
          <button
            onClick={() => setShowTabSwitchWarning(false)}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium w-full"
          >
            I Understand — Return to Exam
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen Prompt Modal
  if (showFullscreenPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Full-Screen Required</h3>
            <p className="text-gray-600">
              This exam requires full-screen mode. Your browser blocked the full-screen request.
            </p>
          </div>
          <div className="space-y-3 text-sm text-gray-700 mb-6">
            <p>Please enable full-screen manually:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Click the full-screen icon in your browser's address bar</li>
              <li>Or press <kbd className="px-2 py-0.5 bg-gray-100 rounded">F11</kbd> (Windows) / <kbd className="px-2 py-0.5 bg-gray-100 rounded">Ctrl+Cmd+F</kbd> (Mac)</li>
              <li>Then click "Continue Exam" below</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowFullscreenPrompt(false); enterFullscreen(); }}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium"
            >
              Try Full-Screen Again
            </button>
            <button
              onClick={() => { setShowFullscreenPrompt(false); enterFullscreen(); }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
            >
              Continue Without Full-Screen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Auto-Submit Modal
  if (showAutoSubmitModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Exam Auto-Submitted</h3>
            <p className="text-gray-600">
              Your exam was interrupted by a page refresh or browser close.
            </p>
          </div>
          <div className="space-y-3 text-sm text-gray-700 mb-6">
            <p className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="font-semibold text-red-900">Security Policy:</span> Refreshing or closing the page during an exam automatically submits your current answers.
            </p>
            <p>Your saved answers will now be submitted automatically.</p>
          </div>
          <button
            onClick={autoSubmitFromDraft}
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Exam Now'}
          </button>
        </div>
      </div>
    );
  }

  // Phase: Result
  if (phase === 'result') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 bg-green-100">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mock Exam Submitted Successfully</h2>
          <p className="text-gray-600 mb-6">You have successfully completed your mock examination.</p>
          <p className="text-sm text-gray-500 mb-8">Your submission has been recorded. You can view your results later from the Mock Results page.</p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetExam}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
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

  if (phase === 'instructions' && !cbtData && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{submitError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetExam}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}
