import { prisma } from '../lib/prisma';
import { checkAndAwardBadges } from './gamification.service';
import { createNotification } from './notification.service';

interface CreateQuestionParams {
  subject: string;
  examType: string;
  institution?: string;
  year: number;
  topic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  text: string;
  imageUrl?: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export async function createQuestion(params: CreateQuestionParams) {
  return prisma.question.create({
    data: {
      subject: params.subject,
      examType: params.examType,
      institution: params.institution,
      year: params.year,
      topic: params.topic,
      difficulty: params.difficulty,
      text: params.text,
      imageUrl: params.imageUrl,
      options: params.options,
      correctOption: params.correctOption,
      explanation: params.explanation,
    },
  });
}

export async function getQuestions(filters: {
  subject?: string;
  examType?: string;
  topic?: string;
  difficulty?: string;
  year?: number;
  limit?: number;
}) {
  const where: any = { isActive: true };
  
  if (filters.subject) where.subject = filters.subject;
  if (filters.examType) where.examType = filters.examType;
  if (filters.topic) where.topic = filters.topic;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.year) where.year = filters.year;

  return prisma.question.findMany({
    where,
    take: filters.limit || 50,
    orderBy: { createdAt: 'desc' },
  });
}

export async function generateCBT(userId: string, params: {
  subject: string;
  examType: string;
  questionCount?: number;
  topics?: string[];
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const questionCount = params.questionCount || 20;
  
  const where: any = {
    isActive: true,
    subject: params.subject,
    examType: params.examType,
  };

  if (params.topics && params.topics.length > 0) {
    where.topic = { in: params.topics };
  }

  const allQuestions = await prisma.question.findMany({ where });
  
  // Randomize questions
  const shuffled = shuffleArray([...allQuestions]);
  const selectedQuestions = shuffled.slice(0, questionCount);

  if (selectedQuestions.length === 0) {
    throw new Error('No questions available for the selected criteria');
  }

  // Create exam record
  const exam = await prisma.exam.create({
    data: {
      title: `${params.subject} CBT - ${new Date().toLocaleDateString()}`,
      examType: params.examType,
      subject: params.subject,
      duration: selectedQuestions.length * 2, // 2 minutes per question
      totalMarks: selectedQuestions.length * 5,
      questions: {
        create: selectedQuestions.map((q, index) => ({
          questionId: q.id,
          order: index + 1,
        })),
      },
    },
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  // Randomize options for each question
  const questionsWithRandomizedOptions = exam.questions.map(eq => {
    const originalOptions = eq.question.options as string[];
    const correctAnswer = originalOptions[eq.question.correctOption];
    
    const shuffledOptions = shuffleArray([...originalOptions]);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      id: eq.question.id,
      text: eq.question.text,
      imageUrl: eq.question.imageUrl,
      options: shuffledOptions,
      correctOption: newCorrectIndex,
      topic: eq.question.topic,
      difficulty: eq.question.difficulty,
      explanation: eq.question.explanation,
    };
  });

  return {
    examId: exam.id,
    title: exam.title,
    subject: exam.subject,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    questionCount: questionsWithRandomizedOptions.length,
    questions: questionsWithRandomizedOptions.map(q => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty,
    })),
  };
}

export async function submitCBT(userId: string, examId: string, answers: Record<string, number>, type: string = 'PRACTICE') {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { include: { question: true } } },
  });

  if (!exam) throw new Error('Exam not found');

  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedAnswers = 0;
  const userAnswers: Record<string, { selected: number; correct: boolean }> = {};
  const weakTopics: Record<string, { correct: number; total: number }> = {};

  for (const eq of exam.questions) {
    const userAnswer = answers[eq.question.id];
    const isCorrect = userAnswer === eq.question.correctOption;
    const topic = eq.question.topic || 'General';

    if (userAnswer === undefined || userAnswer === -1) {
      skippedAnswers++;
      userAnswers[eq.question.id] = { selected: -1, correct: false };
    } else if (isCorrect) {
      correctAnswers++;
      userAnswers[eq.question.id] = { selected: userAnswer, correct: true };
    } else {
      wrongAnswers++;
      userAnswers[eq.question.id] = { selected: userAnswer, correct: false };
    }

    if (!weakTopics[topic]) {
      weakTopics[topic] = { correct: 0, total: 0 };
    }
    weakTopics[topic].total++;
    if (isCorrect) weakTopics[topic].correct++;
  }

  const totalQuestions = exam.questions.length;
  const score = (correctAnswers / totalQuestions) * 100;
  const durationUsed = exam.duration;

  const result = await prisma.cbtResult.create({
    data: {
      userId,
      examId,
      subject: exam.subject,
      type,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      durationUsed,
      userAnswers,
      weakTopics,
    },
  });

  // Check for badges
  await checkAndAwardBadges(userId);

  // Notify if score is low
  if (score < 50) {
    await createNotification({
      userId,
      title: 'CBT Result: Keep Practicing',
      message: `You scored ${score.toFixed(0)}% on ${exam.subject}. Review the topics you missed and try again!`,
      type: 'RESULT',
      link: '/student/results',
    });
  } else if (score >= 80) {
    await createNotification({
      userId,
      title: 'Excellent Performance!',
      message: `You scored ${score.toFixed(0)}% on ${exam.subject}. Keep up the great work!`,
      type: 'RESULT',
      link: '/student/results',
    });
  }

  return {
    resultId: result.id,
    score: result.score,
    correctAnswers: result.correctAnswers,
    wrongAnswers: result.wrongAnswers,
    skippedAnswers: result.skippedAnswers,
    totalQuestions: result.totalQuestions,
    weakTopics: result.weakTopics,
  };
}

export async function getUserCBTResults(userId: string, page = 1, limit = 20, type?: string) {
  const where: any = { userId };
  if (type) where.type = type;

  const [results, total] = await Promise.all([
    prisma.cbtResult.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cbtResult.count({ where }),
  ]);

  return {
    results,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getExamById(examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exam) return null;

  const questionsWithRandomizedOptions = exam.questions.map(eq => {
    const originalOptions = eq.question.options as string[];
    const correctAnswer = originalOptions[eq.question.correctOption];
    
    const shuffledOptions = shuffleArray([...originalOptions]);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      id: eq.question.id,
      text: eq.question.text,
      imageUrl: eq.question.imageUrl,
      options: shuffledOptions,
      correctOption: newCorrectIndex,
      topic: eq.question.topic,
      difficulty: eq.question.difficulty,
      explanation: eq.question.explanation,
    };
  });

  return {
    examId: exam.id,
    title: exam.title,
    subject: exam.subject,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    questionCount: questionsWithRandomizedOptions.length,
    questions: questionsWithRandomizedOptions.map(q => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty,
    })),
  };
}

export async function getMockExamsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { jambSubjects: true },
  });

  const userSubjects = (user?.jambSubjects as string[]) || [];

  const where: any = {
    examType: 'MOCK',
    isActive: true,
    isPublished: true,
  };

  if (userSubjects.length > 0) {
    where.subject = { in: userSubjects };
  }

  return prisma.exam.findMany({
    where,
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createMockExam(teacherId: string, data: {
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  questionIds: string[];
}) {
  const exam = await prisma.exam.create({
    data: {
      title: data.title,
      examType: 'MOCK',
      subject: data.subject,
      duration: data.duration,
      totalMarks: data.totalMarks,
      isPublished: false,
      questions: {
        create: data.questionIds.map((questionId, index) => ({
          questionId,
          order: index + 1,
        })),
      },
    },
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  return exam;
}

export async function publishMockExam(id: string) {
  return prisma.exam.update({
    where: { id },
    data: { isPublished: true, publishedAt: new Date() },
  });
}

export async function unpublishMockExam(id: string) {
  return prisma.exam.update({
    where: { id },
    data: { isPublished: false, publishedAt: null },
  });
}

export async function getPerformanceAnalysis(userId: string) {
  const results = await prisma.cbtResult.findMany({
    where: { userId },
    orderBy: { completedAt: 'asc' },
  });

  if (results.length === 0) {
    return {
      totalCBTs: 0,
      averageScore: 0,
      practiceCBTs: 0,
      practiceAverageScore: 0,
      mockCBTs: 0,
      mockAverageScore: 0,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      progressOverTime: [],
    };
  }

  const subjectStats: Record<string, { scores: number[]; correct: number; total: number }> = {};
  const topicStats: Record<string, { correct: number; total: number }> = {};

  let practiceCBTs = 0;
  let practiceTotalScore = 0;
  let mockCBTs = 0;
  let mockTotalScore = 0;

  for (const result of results) {
    if (result.type === 'MOCK') {
      mockCBTs++;
      mockTotalScore += result.score;
    } else {
      practiceCBTs++;
      practiceTotalScore += result.score;
    }

    if (!subjectStats[result.subject]) {
      subjectStats[result.subject] = { scores: [], correct: 0, total: 0 };
    }
    subjectStats[result.subject].scores.push(result.score);
    subjectStats[result.subject].correct += result.correctAnswers;
    subjectStats[result.subject].total += result.totalQuestions;

    const weakTopics = result.weakTopics as Record<string, { correct: number; total: number }>;
    if (weakTopics) {
      for (const [topic, stats] of Object.entries(weakTopics)) {
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, total: 0 };
        }
        topicStats[topic].correct += stats.correct;
        topicStats[topic].total += stats.total;
      }
    }
  }

  const strengths: { subject: string; average: number }[] = [];
  const weaknesses: { subject: string; average: number }[] = [];

  for (const [subject, stats] of Object.entries(subjectStats)) {
    const average = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    if (average >= 70) {
      strengths.push({ subject, average: Math.round(average) });
    } else if (average < 60) {
      weaknesses.push({ subject, average: Math.round(average) });
    }
  }

  const recommendations: string[] = [];
  for (const weak of weaknesses) {
    recommendations.push(`Focus on ${weak.subject} - current average: ${weak.average}%`);
  }

  const progressOverTime = results.map(r => ({
    date: r.completedAt,
    score: r.score,
    subject: r.subject,
    type: r.type,
  }));

  return {
    totalCBTs: results.length,
    averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    practiceCBTs,
    practiceAverageScore: practiceCBTs > 0 ? Math.round(practiceTotalScore / practiceCBTs) : 0,
    mockCBTs,
    mockAverageScore: mockCBTs > 0 ? Math.round(mockTotalScore / mockCBTs) : 0,
    strengths: strengths.sort((a, b) => b.average - a.average),
    weaknesses: weaknesses.sort((a, b) => a.average - b.average),
    recommendations,
    progressOverTime,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
