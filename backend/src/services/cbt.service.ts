import { prisma } from '../lib/prisma';
import { checkAndAwardBadges } from './gamification.service';
import { createNotification } from './notification.service';
import { getGroupedExamQuestionsForEnglish } from './question-group.service';

interface CreateQuestionParams {
  subject: string;
  examType: string;
  institution?: string;
  year: number;
  topic?: string;
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
  year?: number;
  limit?: number;
}) {
  const where: any = { isActive: true };
  
  if (filters.subject) where.subject = filters.subject;
  if (filters.examType) where.examType = filters.examType;
  if (filters.topic) where.topic = filters.topic;
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

  const userExamTypes = (user.examTypes as string[]) || [];
  if (userExamTypes.length === 0) {
    throw new Error('No exam types registered. Please update your profile first.');
  }

  const normalizedRequested = params.examType.toUpperCase();
  const allowedExamTypes = userExamTypes.map(t => t.toUpperCase());
  if (!allowedExamTypes.includes(normalizedRequested)) {
    throw new Error(`You are not registered for ${params.examType}. Your registered exam types are: ${userExamTypes.join(', ')}`);
  }

  const isJAMB = normalizedRequested === 'JAMB';
  const isEnglish = params.subject === 'English Language';

  let questionCount = 40;
  if (isEnglish) {
    questionCount = 60;
  }

  let selectedQuestions: any[] = [];
  let selectedGroupIds: string[] = [];

  if (params.subject === 'English Language') {
    const groupedResult = await getGroupedExamQuestionsForEnglish({
      examType: normalizedRequested,
      totalQuestions: questionCount,
    });

    selectedQuestions = groupedResult.questions;
    selectedGroupIds = groupedResult.selectedGroupIds;
  } else {
    const where: any = {
      isActive: true,
      subject: params.subject,
      examType: normalizedRequested,
    };

    if (params.topics && params.topics.length > 0) {
      where.topic = { in: params.topics };
    }

    const allQuestions = await prisma.question.findMany({ where });

    if (allQuestions.length === 0) {
      throw new Error(`No questions available for ${params.subject} (${params.examType}). Please contact support.`);
    }

    const shuffled = shuffleArray([...allQuestions]);
    selectedQuestions = shuffled.slice(0, questionCount);
  }

  if (selectedQuestions.length === 0) {
    throw new Error(`No questions available for ${params.subject} (${params.examType}). Please contact support.`);
  }

  const exam = await prisma.exam.create({
    data: {
      title: `${params.subject} CBT - ${new Date().toLocaleDateString()}`,
      examType: normalizedRequested,
      subject: params.subject,
      duration: selectedQuestions.length * 2,
      totalMarks: isJAMB ? 100 : selectedQuestions.length * 5,
      questions: {
        create: selectedQuestions.map((q, index) => {
          const originalOptions = q.options as string[];
          const correctAnswer = originalOptions[q.correctOption];
          const shuffledOptions = shuffleArray([...originalOptions]);
          const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
          return {
            questionId: q.id,
            order: index + 1,
            options: shuffledOptions,
            correctOption: newCorrectIndex,
            questionGroupId: q.groupId || null,
            questionGroupType: q.groupType || null,
          };
        }),
      },
    },
    include: {
      questions: {
        include: {
          question: {
            include: { questionGroup: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  const questionsWithRandomizedOptions = exam.questions.map(eq => {
    const group = eq.question?.questionGroup;
    return {
    id: eq.question.id,
    text: eq.question.text,
    imageUrl: eq.question.imageUrl,
    options: (eq.options as string[]) || [],
    topic: eq.question.topic,
    explanation: eq.question.explanation,
    groupType: eq.questionGroupType,
    groupId: eq.questionGroupId,
    passage: group?.passage || undefined,
    groupTitle: group?.title || undefined,
    groupInstructions: group?.instructions || undefined,
  };});

  return {
    examId: exam.id,
    title: exam.title,
    subject: exam.subject,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    questionCount: questionsWithRandomizedOptions.length,
    questions: questionsWithRandomizedOptions,
    selectedGroupIds,
  };
}

export async function submitCBT(userId: string, examId: string, answers: Record<string, number>, type: string = 'PRACTICE') {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { include: { question: { include: { questionGroup: true } } } } },
  });

  if (!exam) throw new Error('Exam not found');

  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedAnswers = 0;
  const userAnswers: Record<string, { selected: number; correct: boolean }> = {};
  const weakTopics: Record<string, { correct: number; total: number }> = {};

  for (const eq of exam.questions) {
    const userAnswer = answers[eq.question.id];
    const correctAnswer = eq.correctOption ?? eq.question.correctOption;
    const isCorrect = userAnswer === correctAnswer;
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
  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const totalMarks = exam.totalMarks || 100;
  const score = totalMarks > 0 ? (percentage / 100) * totalMarks : percentage;
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

  await checkAndAwardBadges(userId);

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
    type: result.type,
    submittedAt: result.completedAt,
    ...(type === 'PRACTICE'
      ? {
          score: result.score,
          correctAnswers: result.correctAnswers,
          wrongAnswers: result.wrongAnswers,
          skippedAnswers: result.skippedAnswers,
          totalQuestions: result.totalQuestions,
          weakTopics: result.weakTopics,
        }
      : {}),
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
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exam) return null;

  const questions = exam.questions.map((eq) => ({
    id: eq.question.id,
    text: eq.question.text,
    imageUrl: eq.question.imageUrl,
    options: (eq.options as string[]) || (eq.question.options as string[]),
    topic: eq.question.topic,
    explanation: eq.question.explanation,
    subject: eq.question.subject,
    groupType: eq.questionGroupType,
    groupId: eq.questionGroupId,
    passage: eq.question?.questionGroup?.passage || undefined,
    groupTitle: eq.question?.questionGroup?.title || undefined,
    groupInstructions: eq.question?.questionGroup?.instructions || undefined,
  }));

  return {
    examId: exam.id,
    title: exam.title,
    subject: exam.subject,
    examType: exam.examType,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    questionCount: questions.length,
    questions,
  };
}

export async function getMockExamsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { jambSubjects: true },
  });

  const userSubjects = (user?.jambSubjects as string[]) || [];

  const exams = await prisma.exam.findMany({
    where: {
      examType: 'MOCK',
      isActive: true,
      isPublished: true,
    },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mockResults = await prisma.cbtResult.findMany({
    where: {
      userId,
      type: 'MOCK',
      examId: { not: null },
    },
    select: {
      examId: true,
      score: true,
      completedAt: true,
    },
  });

  const mockAttempts = await prisma.mockExamAttempt.findMany({
    where: {
      userId,
    },
    select: {
      examId: true,
      isCompleted: true,
      retakeRequested: true,
      retakeApproved: true,
    },
  });

  const resultMap = new Map(
    mockResults.filter(r => r.examId !== null).map(r => [r.examId!, { score: r.score, completedAt: r.completedAt }])
  );

  const attemptMap = new Map(
    mockAttempts.map(a => [a.examId, a])
  );

  return exams.map(exam => {
    const result = resultMap.get(exam.id);
    const attempt = attemptMap.get(exam.id);
    const isCompleted = attempt?.isCompleted || !!result;
    const retakeApproved = attempt?.retakeApproved || false;

    return {
      ...exam,
      totalQuestions: (exam as any).questionsPerSubject
        ? (exam as any).questionsPerSubject * Math.max(userSubjects.length, 1)
        : exam.questions.length,
      status: isCompleted ? 'completed' : 'available',
      score: result?.score,
      completedAt: result?.completedAt?.toISOString(),
      canRetake: isCompleted ? retakeApproved : true,
      retakeRequested: attempt?.retakeRequested || false,
      retakeApproved,
    };
  });
}

export async function getAllMockExamsForTeacher(userId: string) {
  return prisma.exam.findMany({
    where: {
      examType: 'MOCK',
      isActive: true,
    },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllMockExamsForAdmin() {
  return prisma.exam.findMany({
    where: {
      examType: 'MOCK',
    },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMockExamRetakeRequests(examId: string) {
  const attempts = await prisma.mockExamAttempt.findMany({
    where: {
      examId,
      retakeRequested: true,
    },
    select: {
      id: true,
      userId: true,
      completedAt: true,
      retakeRequested: true,
      retakeApproved: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    } as any,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return attempts.map((attempt: any) => ({
    id: attempt.id,
    userId: attempt.userId,
    studentName: attempt.user.fullName,
    email: attempt.user.email,
    retakeRequested: attempt.retakeRequested,
    retakeApproved: attempt.retakeApproved,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
  }));
}

export async function getAdminCBTStats() {
  const [totalExams, totalResults, publishedExams, draftExams] = await Promise.all([
    prisma.exam.count({ where: { examType: 'MOCK' } }),
    prisma.cbtResult.count(),
    prisma.exam.count({ where: { examType: 'MOCK', isPublished: true } }),
    prisma.exam.count({ where: { examType: 'MOCK', isPublished: false } }),
  ]);

  const avgScore = totalResults > 0
    ? await prisma.cbtResult.aggregate({ _avg: { score: true } })
    : { _avg: { score: 0 } };

  const recentResults = await prisma.cbtResult.findMany({
    take: 10,
    orderBy: { completedAt: 'desc' },
    include: {
      user: {
        select: { fullName: true, email: true },
      },
      exam: {
        select: { title: true, subject: true },
      },
    },
  });

  return {
    totalExams,
    totalResults,
    publishedExams,
    draftExams,
    averageScore: Math.round(avgScore._avg.score || 0),
    recentResults,
  };
}

export async function getAllCBTResultsForAdmin(page = 1, limit = 20) {
  const [results, total] = await Promise.all([
    prisma.cbtResult.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { completedAt: 'desc' },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
        exam: {
          select: { title: true, subject: true },
        },
      },
    }),
    prisma.cbtResult.count(),
  ]);

  return {
    results,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getFilteredCBTResultsForAdmin(type?: string, examType?: string, page = 1, limit = 50) {
  const where: any = {};
  if (type && type !== 'ALL') {
    where.type = type;
  }
  if (examType && examType !== 'ALL') {
    where.examType = examType;
  }

  const [results, total] = await Promise.all([
    prisma.cbtResult.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { completedAt: 'desc' },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
        exam: {
          select: { title: true, subject: true, examType: true },
        },
      },
    }),
    prisma.cbtResult.count({ where }),
  ]);

  return {
    results,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAdminFilteredResults(options: {
  type?: string;
  examId?: string;
  sortBy?: 'score' | 'date';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  const { type, examId, sortBy = 'score', page = 1, limit = 50, startDate, endDate } = options;

  const where: any = {};
  if (type && type !== 'ALL') {
    where.type = type;
  }
  if (examId) {
    where.examId = examId;
  }
  if (startDate) {
    where.completedAt = { gte: new Date(startDate) };
  }
  if (endDate) {
    where.completedAt = { ...where.completedAt, lte: new Date(endDate) };
  }

  const orderBy: any = sortBy === 'score'
    ? { score: 'desc' }
    : { completedAt: 'desc' };

  const [results, total] = await Promise.all([
    prisma.cbtResult.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy,
      include: {
        user: {
          select: { fullName: true, email: true, studentEmail: true },
        },
        exam: {
          include: {
            questions: {
              include: { question: { include: { questionGroup: true } } },
            },
          },
        },
      },
    }),
    prisma.cbtResult.count({ where }),
  ]);

  const examTitle = results.find(r => r.examId === examId)?.exam?.title || (results[0]?.exam?.title) || null;

  const mappedResults = results.map(result => {
    const exam = result.exam;
    const userAnswers = (result.userAnswers as Record<string, { selected: number; correct: boolean }> | null) || {};
    const subjectScores: Record<string, { total: number; correct: number }> = {};

    (exam?.questions || []).forEach((eq: any) => {
      const subject = eq.question?.subject || result.subject;
      if (!subjectScores[subject]) {
        subjectScores[subject] = { total: 0, correct: 0 };
      }
      subjectScores[subject].total++;
      const answer = userAnswers[eq.questionId];
      if (answer?.correct) {
        subjectScores[subject].correct++;
      }
    });

    const subjectEntries = Object.entries(subjectScores).map(([subject, data]) => ({
      subject,
      score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      correct: data.correct,
      total: data.total,
    }));

    const aggregate = subjectEntries.length > 0
      ? Math.round(subjectEntries.reduce((sum, s) => sum + s.score, 0) / subjectEntries.length)
      : Math.round(result.score);

    return {
      id: result.id,
      studentName: result.user?.fullName || result.user?.email || 'Unknown',
      email: result.user?.email || '',
      subjectScores,
      subjectEntries,
      aggregate,
      score: result.score,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      skippedAnswers: result.skippedAnswers,
      completedAt: result.completedAt,
      type: result.type,
      examTitle: exam?.title || result.subject,
      examId: result.examId,
    };
  });

  return {
    results: mappedResults,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    filter: { type: type || 'ALL', examId: examId || null, examTitle: examTitle, sortBy },
  };
}

export async function createMockExam(teacherId: string, data: {
  title: string;
  subject: string;
  duration: number;
  questionsPerSubject: number;
}) {
  const exam = await prisma.exam.create({
    data: {
      title: data.title,
      examType: 'MOCK',
      subject: data.subject,
      duration: data.duration,
      totalMarks: 400,
      questionsPerSubject: data.questionsPerSubject,
      isPublished: false,
    },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  return exam;
}

export async function startMockExamAttempt(userId: string, examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) throw new Error('Mock exam not found');
  if (exam.examType !== 'MOCK') throw new Error('Invalid exam type');
  if (!exam.isPublished) throw new Error('Mock exam is not published');

  const existingAttempt = await prisma.mockExamAttempt.findFirst({
    where: {
      userId,
      examId,
      isCompleted: true,
    },
    orderBy: { id: 'desc' },
  });

  if (existingAttempt && !existingAttempt.retakeApproved) {
    throw new Error('You have already completed this mock exam. Your retake request is pending admin approval.');
  }

  const questionsPerSubject = exam.questionsPerSubject || 10;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { examTypes: true, jambSubjects: true, olevelResults: true },
  });

  const userExamTypes = (user?.examTypes as string[]) || [];
  const jambSubjects = (user?.jambSubjects as string[]) || [];
  const olevelResults = (user?.olevelResults as string[]) || [];

  if (userExamTypes.length === 0) {
    throw new Error('No exam types registered. Please update your profile first.');
  }

  const primaryExamType = userExamTypes[0].toUpperCase();

  let userSubjects: string[] = [];
  if (primaryExamType === 'WAEC' || primaryExamType === 'NECO') {
    userSubjects = olevelResults;
  } else {
    userSubjects = jambSubjects;
  }

  if (userSubjects.length === 0) {
    throw new Error(`No subjects registered for ${primaryExamType}. Please update your profile first.`);
  }

  const allSelectedQuestions: any[] = [];
  const allSelectedGroupIds: string[] = [];

  for (const subject of userSubjects) {
    const subjectQuestionCount = subject === 'English Language' ? 60 : 40;

    if (subject === 'English Language') {
      const groupedResult = await getGroupedExamQuestionsForEnglish({
        examType: primaryExamType,
        totalQuestions: subjectQuestionCount,
      });

      allSelectedQuestions.push(...groupedResult.questions);
      allSelectedGroupIds.push(...groupedResult.selectedGroupIds);
    } else {
      const where: any = {
        isActive: true,
        subject,
        examType: primaryExamType,
      };

      const subjectQuestions = await prisma.question.findMany({ where });
      const shuffled = shuffleArray([...subjectQuestions]);
      const selected = shuffled.slice(0, subjectQuestionCount);

      allSelectedQuestions.push(...selected.map(q => ({ ...q, subject })));
    }
  }

  const englishQuestions = allSelectedQuestions.filter(q => q.subject === 'English Language');
  const otherQuestions = allSelectedQuestions.filter(q => q.subject !== 'English Language');

  const finalShuffled = [...shuffleArray([...otherQuestions])];

  if (englishQuestions.length > 0) {
    finalShuffled.unshift(...englishQuestions);
  }

  if (finalShuffled.length === 0) {
    throw new Error(`No ${primaryExamType} questions available for your registered subjects. Please contact support.`);
  }

  const attemptExam = await prisma.exam.create({
    data: {
      title: `${exam.title} - ${new Date().toLocaleDateString()}`,
      examType: 'MOCK',
      subject: userSubjects[0] || exam.subject,
      duration: exam.duration,
      totalMarks: 400,
      questions: {
        create: finalShuffled.map((q, index) => ({
          questionId: q.id,
          order: index + 1,
          questionGroupId: q.groupId || null,
          questionGroupType: q.groupType || null,
        })),
      },
    },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  const questionsWithRandomizedOptions = attemptExam.questions.map(eq => {
    const originalOptions = eq.question.options as string[];
    const correctAnswer = originalOptions[eq.question.correctOption];

    const shuffledOptions = shuffleArray([...originalOptions]);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      examId: attemptExam.id,
      questionId: eq.questionId,
      options: shuffledOptions,
      correctOption: newCorrectIndex,
      questionGroupId: eq.questionGroupId,
      questionGroupType: eq.questionGroupType,
    };
  });

  for (const q of questionsWithRandomizedOptions) {
    await prisma.examQuestion.update({
      where: {
        examId_questionId: {
          examId: q.examId,
          questionId: q.questionId,
        },
      },
      data: {
        options: q.options,
        correctOption: q.correctOption,
        questionGroupId: q.questionGroupId,
        questionGroupType: q.questionGroupType,
      },
    });
  }

  const updatedExam = await prisma.exam.findUnique({
    where: { id: attemptExam.id },
    include: {
      questions: {
        include: {
          question: {
            include: { questionGroup: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  const finalQuestions = (updatedExam?.questions || []).map(eq => {
    const originalOptions = eq.question.options as string[];
    const correctAnswer = originalOptions[eq.question.correctOption];

    const shuffledOptions = (eq.options as string[]) || shuffleArray([...originalOptions]);
    const newCorrectIndex = eq.correctOption ?? shuffledOptions.indexOf(correctAnswer);
    const group = eq.question?.questionGroup;

    return {
      id: eq.question.id,
      text: eq.question.text,
      imageUrl: eq.question.imageUrl,
      options: shuffledOptions,
      correctOption: newCorrectIndex,
      topic: eq.question.topic,
      explanation: eq.question.explanation,
      subject: eq.question.subject,
      groupType: eq.questionGroupType,
      groupId: eq.questionGroupId,
      passage: group?.passage || undefined,
      groupTitle: group?.title || undefined,
      groupInstructions: group?.instructions || undefined,
    };
  });

  return {
    examId: attemptExam.id,
    title: attemptExam.title,
    subject: attemptExam.subject,
    duration: attemptExam.duration,
    totalMarks: attemptExam.totalMarks,
    questionCount: finalQuestions.length,
    questions: finalQuestions,
    selectedGroupIds: allSelectedGroupIds,
  };
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

export async function updateMockExam(id: string, data: {
  title: string;
  subject: string;
  duration: number;
  questionsPerSubject: number;
}) {
  const exam = await prisma.exam.update({
    where: { id },
    data: {
      title: data.title,
      subject: data.subject,
      duration: data.duration,
      totalMarks: 400,
      questionsPerSubject: data.questionsPerSubject,
    },
  });

  await prisma.examQuestion.deleteMany({
    where: { examId: id },
  });

  return prisma.exam.findUnique({
    where: { id },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function deleteMockExam(id: string) {
  return prisma.exam.delete({
    where: { id },
  });
}

export async function getMockExamQuestions(examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: {
          question: {
            include: { questionGroup: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exam) return null;

  return exam.questions.map((eq) => {
    const group = eq.question?.questionGroup;
    return {
    id: eq.question.id,
    text: eq.question.text,
    imageUrl: eq.question.imageUrl,
    options: eq.question.options as string[],
    correctOption: eq.question.correctOption,
    topic: eq.question.topic,
    explanation: eq.question.explanation,
    order: eq.order,
    passage: group?.passage || undefined,
    groupTitle: group?.title || undefined,
    groupInstructions: group?.instructions || undefined,
  };});
}

export async function addQuestionsToMockExam(examId: string, questionIds: string[]) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exam) throw new Error('Mock exam not found');

  const existingQuestionIds = new Set(exam.questions.map((eq) => eq.questionId));
  const newQuestionIds = questionIds.filter((id) => !existingQuestionIds.has(id));

  if (newQuestionIds.length === 0) {
    return exam.questions.map((eq) => {
      const group = eq.question?.questionGroup;
      return {
      id: eq.question.id,
      text: eq.question.text,
      imageUrl: eq.question.imageUrl,
      options: eq.question.options as string[],
      correctOption: eq.question.correctOption,
      topic: eq.question.topic,
      explanation: eq.question.explanation,
      order: eq.order,
      passage: group?.passage || undefined,
      groupTitle: group?.title || undefined,
      groupInstructions: group?.instructions || undefined,
    };});
  }

  const maxOrder = exam.questions.length > 0 ? Math.max(...exam.questions.map((eq) => eq.order)) : 0;

  await prisma.examQuestion.createMany({
    data: newQuestionIds.map((questionId, index) => ({
      examId,
      questionId,
      order: maxOrder + index + 1,
    })),
  });

  const updatedExam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  return updatedExam!.questions.map((eq) => ({
    id: eq.question.id,
    text: eq.question.text,
    imageUrl: eq.question.imageUrl,
    options: eq.question.options as string[],
    correctOption: eq.question.correctOption,
    topic: eq.question.topic,
    explanation: eq.question.explanation,
    order: eq.order,
  }));
}

export async function uploadQuestionsToMockExam(examId: string, questions: Array<{
  text: string;
  options: string[];
  correctOption: number;
  topic?: string;
  explanation?: string;
  subject: string;
  examType: string;
}>) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: { include: { question: { include: { questionGroup: true } } }, orderBy: { order: 'asc' } },
    },
  });

  if (!exam) throw new Error('Mock exam not found');

  const createdQuestions: any[] = [];

  for (const q of questions) {
    if (!q.examType) {
      throw new Error('examType is required for each question');
    }

    const created = await prisma.question.create({
      data: {
        subject: q.subject || exam.subject,
        examType: q.examType.toUpperCase(),
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        topic: q.topic,
        explanation: q.explanation,
        year: new Date().getFullYear(),
      },
    });

    createdQuestions.push(created);
  }

  const maxOrder = exam.questions.length > 0 ? Math.max(...exam.questions.map((eq) => eq.order)) : 0;

  await prisma.examQuestion.createMany({
    data: createdQuestions.map((question, index) => ({
      examId,
      questionId: question.id,
      order: maxOrder + index + 1,
    })),
  });

  const updatedExam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  return updatedExam!.questions.map((eq) => ({
    id: eq.question.id,
    text: eq.question.text,
    imageUrl: eq.question.imageUrl,
    options: eq.question.options as string[],
    correctOption: eq.question.correctOption,
    topic: eq.question.topic,
    explanation: eq.question.explanation,
    order: eq.order,
  }));
}

export async function removeQuestionFromMockExam(examId: string, questionId: string) {
  await prisma.examQuestion.delete({
    where: {
      examId_questionId: {
        examId,
        questionId,
      },
    },
  });

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: { question: { include: { questionGroup: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  return exam!.questions.map((eq) => ({
    id: eq.question.id,
    text: eq.question.text,
    imageUrl: eq.question.imageUrl,
    options: eq.question.options as string[],
    correctOption: eq.question.correctOption,
    topic: eq.question.topic,
    explanation: eq.question.explanation,
    order: eq.order,
  }));
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

export async function getCBTResultById(userId: string, resultId: string) {
  const result = await prisma.cbtResult.findFirst({
    where: { id: resultId, userId },
    include: {
      exam: {
        include: {
          questions: {
            include: { question: { include: { questionGroup: true } } },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!result || !result.exam) return null;

  const userAnswers = result.userAnswers as Record<string, { selected: number; correct: boolean }> | null;

  const corrections = result.exam.questions.map((eq, index) => {
    const answer = userAnswers?.[eq.question.id];
    return {
      questionNumber: index + 1,
      question: eq.question.text,
      options: (eq.options as string[]) || (eq.question.options as string[]),
      correctOption: eq.correctOption ?? eq.question.correctOption,
      userAnswer: answer?.selected ?? -1,
      isCorrect: answer?.correct ?? false,
      explanation: eq.question.explanation,
      topic: eq.question.topic,
      subject: eq.question.subject,
      groupType: eq.questionGroupType,
      groupId: eq.questionGroupId,
      passage: eq.question?.questionGroup?.passage || undefined,
      groupTitle: eq.question?.questionGroup?.title || undefined,
      groupInstructions: eq.question?.questionGroup?.instructions || undefined,
    };
  });

  return {
    result: {
      id: result.id,
      subject: result.subject,
      type: result.type,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      skippedAnswers: result.skippedAnswers,
      durationUsed: result.durationUsed,
      completedAt: result.completedAt,
      weakTopics: result.weakTopics,
    },
    corrections,
  };
}

export async function getCBTResultByIdForAdmin(resultId: string) {
  const result = await prisma.cbtResult.findFirst({
    where: { id: resultId },
    include: {
      user: {
        select: { fullName: true, email: true, studentEmail: true },
      },
      exam: {
        include: {
          questions: {
            include: { question: { include: { questionGroup: true } } },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!result || !result.exam) return null;

  const userAnswers = result.userAnswers as Record<string, { selected: number; correct: boolean }> | null;

  const corrections = result.exam.questions.map((eq, index) => {
    const answer = userAnswers?.[eq.question.id];
    return {
      questionNumber: index + 1,
      question: eq.question.text,
      options: (eq.options as string[]) || (eq.question.options as string[]),
      correctOption: eq.correctOption ?? eq.question.correctOption,
      userAnswer: answer?.selected ?? -1,
      isCorrect: answer?.correct ?? false,
      explanation: eq.question.explanation,
      topic: eq.question.topic,
      subject: eq.question.subject,
      groupType: eq.questionGroupType,
      groupId: eq.questionGroupId,
      passage: eq.question?.questionGroup?.passage || undefined,
      groupTitle: eq.question?.questionGroup?.title || undefined,
      groupInstructions: eq.question?.questionGroup?.instructions || undefined,
    };
  });

  return {
    result: {
      id: result.id,
      studentName: result.user?.fullName || result.user?.email || 'Unknown',
      email: result.user?.email || '',
      studentEmail: result.user?.studentEmail || '',
      subject: result.subject,
      type: result.type,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      skippedAnswers: result.skippedAnswers,
      durationUsed: result.durationUsed,
      completedAt: result.completedAt,
      weakTopics: result.weakTopics,
      examTitle: result.exam?.title || result.subject,
      examId: result.examId,
    },
    corrections,
  };
}

export async function updateExamQuestion(examId: string, questionId: string, data: {
  text?: string;
  options?: string[];
  correctOption?: number;
  explanation?: string;
}) {
  const examQuestion = await prisma.examQuestion.findUnique({
    where: {
      examId_questionId: {
        examId,
        questionId,
      },
    },
    include: {
      question: true,
    },
  });

  if (!examQuestion) {
    throw new Error('Exam question not found');
  }

  const questionUpdate: any = {};
  if (data.text !== undefined) questionUpdate.text = data.text;
  if (data.explanation !== undefined) questionUpdate.explanation = data.explanation;

  const examQuestionUpdate: any = {};
  if (data.options !== undefined) examQuestionUpdate.options = data.options;
  if (data.correctOption !== undefined) examQuestionUpdate.correctOption = data.correctOption;

  if (Object.keys(questionUpdate).length > 0) {
    await prisma.question.update({
      where: { id: questionId },
      data: questionUpdate,
    });
  }

  if (Object.keys(examQuestionUpdate).length > 0) {
    await prisma.examQuestion.update({
      where: {
        examId_questionId: {
          examId,
          questionId,
        },
      },
      data: examQuestionUpdate,
    });
  }

  return prisma.examQuestion.findUnique({
    where: {
      examId_questionId: {
        examId,
        questionId,
      },
    },
    include: {
      question: true,
    },
  });
}

export async function recalculateCbtResult(resultId: string) {
  const result = await prisma.cbtResult.findFirst({
    where: { id: resultId },
    include: {
      user: true,
      exam: {
        include: {
          questions: {
            include: { question: { include: { questionGroup: true } } },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!result || !result.exam) {
    throw new Error('Result not found');
  }

  const userAnswers = (result.userAnswers as Record<string, { selected: number; correct: boolean }>) || {};
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedAnswers = 0;
  const updatedUserAnswers: Record<string, { selected: number; correct: boolean }> = {};

  for (const eq of result.exam.questions) {
    const userAnswer = userAnswers[eq.question.id];
    const correctAnswer = eq.correctOption ?? eq.question.correctOption;
    const isCorrect = userAnswer?.selected === correctAnswer;

    if (userAnswer?.selected === undefined || userAnswer?.selected === -1) {
      skippedAnswers++;
      updatedUserAnswers[eq.question.id] = { selected: -1, correct: false };
    } else if (isCorrect) {
      correctAnswers++;
      updatedUserAnswers[eq.question.id] = { selected: userAnswer.selected, correct: true };
    } else {
      wrongAnswers++;
      updatedUserAnswers[eq.question.id] = { selected: userAnswer.selected, correct: false };
    }
  }

  const totalQuestions = result.exam.questions.length;
  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const totalMarks = result.exam.totalMarks || 100;
  const score = totalMarks > 0 ? (percentage / 100) * totalMarks : percentage;

  const updatedResult = await prisma.cbtResult.update({
    where: { id: resultId },
    data: {
      score,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      totalQuestions,
      userAnswers: updatedUserAnswers,
    },
  });

  return {
    result: updatedResult,
    corrections: result.exam.questions.map((eq, index) => {
      const answer = updatedUserAnswers[eq.question.id];
      return {
        questionNumber: index + 1,
        question: eq.question.text,
        options: (eq.options as string[]) || (eq.question.options as string[]),
        correctOption: eq.correctOption ?? eq.question.correctOption,
        userAnswer: answer?.selected ?? -1,
        isCorrect: answer?.correct ?? false,
        explanation: eq.question.explanation,
        topic: eq.question.topic,
        subject: eq.question.subject,
        groupType: eq.questionGroupType,
        groupId: eq.questionGroupId,
        passage: eq.question?.questionGroup?.passage || undefined,
        groupTitle: eq.question?.questionGroup?.title || undefined,
        groupInstructions: eq.question?.questionGroup?.instructions || undefined,
      };
    }),
  };
}

export async function getResultReviewData(resultId: string) {
  const result = await prisma.cbtResult.findFirst({
    where: { id: resultId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          studentEmail: true,
        },
      },
      exam: {
        include: {
          questions: {
            include: { question: { include: { questionGroup: true } } },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!result || !result.exam) {
    return null;
  }

  const userAnswers = (result.userAnswers as Record<string, { selected: number; correct: boolean }>) || {};

  return {
    result: {
      id: result.id,
      studentName: result.user?.fullName || result.user?.email || 'Unknown',
      email: result.user?.email || '',
      studentEmail: result.user?.studentEmail || '',
      subject: result.subject,
      type: result.type,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      skippedAnswers: result.skippedAnswers,
      durationUsed: result.durationUsed,
      completedAt: result.completedAt,
      examTitle: result.exam?.title || result.subject,
      examId: result.examId,
    },
    questions: result.exam.questions.map((eq, index) => {
      const answer = userAnswers[eq.question.id];
      return {
        questionNumber: index + 1,
        questionId: eq.questionId,
        text: eq.question.text,
        options: (eq.options as string[]) || (eq.question.options as string[]),
        correctOption: eq.correctOption ?? eq.question.correctOption,
        userAnswer: answer?.selected ?? -1,
        isCorrect: answer?.correct ?? false,
        explanation: eq.question.explanation,
        topic: eq.question.topic,
        subject: eq.question.subject,
        groupType: eq.questionGroupType,
        groupId: eq.questionGroupId,
        passage: eq.question?.questionGroup?.passage || undefined,
        groupTitle: eq.question?.questionGroup?.title || undefined,
        groupInstructions: eq.question?.questionGroup?.instructions || undefined,
      };
    }),
  };
}

export async function getMockExamResultDetail(resultId: string) {
  const result = await prisma.cbtResult.findFirst({
    where: { id: resultId, type: 'MOCK' },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          studentEmail: true,
        },
      },
      exam: {
        include: {
          questions: {
            include: { question: { include: { questionGroup: true } } },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!result) {
    return null;
  }

  const userAnswers = (result.userAnswers as Record<string, { selected: number; correct: boolean }>) || {};

  let corrections;

  if (result.exam) {
    corrections = result.exam.questions.map((eq, index) => {
      const answer = userAnswers[eq.question.id];
      const group = eq.question?.questionGroup;
      return {
        questionNumber: index + 1,
        questionId: eq.questionId,
        question: eq.question.text,
        options: (eq.options as string[]) || (eq.question.options as string[]),
        correctOption: eq.correctOption ?? eq.question.correctOption,
        userAnswer: answer?.selected ?? -1,
        isCorrect: answer?.correct ?? false,
        explanation: eq.question.explanation,
        topic: eq.question.topic,
        subject: eq.question.subject,
        groupType: eq.questionGroupType,
        groupId: eq.questionGroupId,
        passage: group?.passage || undefined,
        groupTitle: group?.title || undefined,
        groupInstructions: group?.instructions || undefined,
      };
    });
  } else {
    const questionIds = Object.keys(userAnswers);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { questionGroup: true },
    });

    corrections = questions.map((q, index) => {
      const answer = userAnswers[q.id];
      return {
        questionNumber: index + 1,
        questionId: q.id,
        question: q.text,
        options: q.options as string[],
        correctOption: q.correctOption,
        userAnswer: answer?.selected ?? -1,
        isCorrect: answer?.correct ?? false,
        explanation: q.explanation,
        topic: q.topic,
        subject: q.subject,
        groupType: q.groupType,
        groupId: q.groupId,
        passage: q.questionGroup?.passage || undefined,
        groupTitle: q.questionGroup?.title || undefined,
        groupInstructions: q.questionGroup?.instructions || undefined,
      };
    });
  }

  const subjectScores: Record<string, { total: number; correct: number }> = {};
  corrections.forEach((c) => {
    const subject = c.subject || result.subject;
    if (!subjectScores[subject]) {
      subjectScores[subject] = { total: 0, correct: 0 };
    }
    subjectScores[subject].total++;
    if (c.isCorrect) subjectScores[subject].correct++;
  });

  const subjectEntries = Object.entries(subjectScores).map(([subject, data]) => ({
    subject,
    score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    correct: data.correct,
    total: data.total,
  }));

  const aggregate =
    subjectEntries.length > 0
      ? Math.round(subjectEntries.reduce((sum, s) => sum + s.score, 0) / subjectEntries.length)
      : Math.round(result.score);

  return {
    result: {
      id: result.id,
      studentName: result.user?.fullName || result.user?.email || 'Unknown',
      email: result.user?.email || '',
      studentEmail: result.user?.studentEmail || '',
      subject: result.subject,
      type: result.type,
      score: result.score,
      aggregate,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      skippedAnswers: result.skippedAnswers,
      durationUsed: result.durationUsed,
      completedAt: result.completedAt,
      examTitle: result.exam?.title || result.subject,
      examId: result.examId,
    },
    subjectScores,
    subjectEntries,
    corrections,
  };
}

export async function calculateJAMBAggregate(userId: string) {
  const results = await prisma.cbtResult.findMany({
    where: {
      userId,
      type: 'JAMB',
    },
    include: {
      exam: {
        select: {
          subject: true,
          examType: true,
        },
      },
    },
  });

  const subjectScores: Record<string, number> = {};
  for (const result of results) {
    if (result.exam) {
      subjectScores[result.exam.subject] = result.score;
    }
  }

  const aggregate = Object.values(subjectScores).reduce((sum, score) => sum + score, 0);

  return {
    subjectScores,
    aggregate: Math.round(aggregate),
    subjectCount: Object.keys(subjectScores).length,
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
