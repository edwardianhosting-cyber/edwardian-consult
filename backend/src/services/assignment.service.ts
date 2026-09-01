import { prisma } from '../lib/prisma';

export async function createAssignment(teacherId: string, data: any) {
  return prisma.assignment.create({
    data: {
      ...data,
      createdById: teacherId,
    },
  });
}

export async function getAssignments(teacherId: string, role: string) {
  const where: any = { isActive: true };
  if (role !== 'ADMIN') {
    where.createdById = teacherId;
  }
  return prisma.assignment.findMany({
    where,
    include: {
      questions: true,
      attempts: { include: { user: { select: { fullName: true, email: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPublishedAssignmentsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { jambSubjects: true },
  });

  const userSubjects = (user?.jambSubjects as string[]) || [];

  const where: any = {
    isActive: true,
    isPublished: true,
  };

  if (userSubjects.length > 0) {
    where.subject = { in: userSubjects };
  }

  return prisma.assignment.findMany({
    where,
    include: {
      questions: { orderBy: { order: 'asc' } },
      createdBy: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function publishAssignment(id: string) {
  return prisma.assignment.update({
    where: { id },
    data: { isPublished: true, publishedAt: new Date() },
  });
}

export async function unpublishAssignment(id: string) {
  return prisma.assignment.update({
    where: { id },
    data: { isPublished: false, publishedAt: null },
  });
}

export async function getAssignmentById(id: string) {
  return prisma.assignment.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      attempts: { include: { user: { select: { fullName: true, email: true } } } },
    },
  });
}

export async function updateAssignment(id: string, data: any) {
  return prisma.assignment.update({
    where: { id },
    data,
  });
}

export async function deleteAssignment(id: string) {
  return prisma.assignment.delete({
    where: { id },
  });
}

export async function getAssignmentQuestions(assignmentId: string) {
  return prisma.assignmentQuestion.findMany({
    where: { assignmentId },
    orderBy: { order: 'asc' },
  });
}

export async function submitAssignmentAttempt(userId: string, assignmentId: string, data: any) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { questions: true },
  });

  if (!assignment) throw new Error('Assignment not found');

  let correctAnswers = 0;
  const userAnswers: Record<string, number> = {};

  for (const question of assignment.questions) {
    const userAnswer = data.answers?.[question.id];
    userAnswers[question.id] = userAnswer ?? -1;
    if (userAnswer === question.correctOption) {
      correctAnswers++;
    }
  }

  const score = assignment.questions.length > 0
    ? (correctAnswers / assignment.questions.length) * assignment.totalMarks
    : 0;

  const attempt = await prisma.assignmentAttempt.create({
    data: {
      assignmentId,
      userId,
      score,
      totalQuestions: assignment.questions.length,
      correctAnswers,
      wrongAnswers: assignment.questions.length - correctAnswers,
      skippedAnswers: Object.values(data.answers || {}).filter((a: any) => a === -1 || a === undefined).length,
      userAnswers,
    },
  });

  return attempt;
}

export async function getAssignmentResults(userId: string) {
  return prisma.assignmentAttempt.findMany({
    where: { userId },
    include: {
      assignment: { select: { id: true, title: true, subject: true, totalMarks: true } },
    },
    orderBy: { submittedAt: 'desc' },
  });
}

export async function getAssignmentResultById(id: string) {
  return prisma.assignmentAttempt.findUnique({
    where: { id },
    include: {
      assignment: { include: { questions: true } },
      user: { select: { fullName: true, email: true } },
    },
  });
}

export async function uploadAssignmentFile(file: Express.Multer.File) {
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = `uploads/assignments/${fileName}`;
  return { url: `/${filePath}`, fileName };
}
