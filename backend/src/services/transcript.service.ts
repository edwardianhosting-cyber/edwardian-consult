import { prisma } from '../lib/prisma';

export async function generateTranscript(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      cbtResults: {
        orderBy: { completedAt: 'asc' },
      },
      enrollments: true,
      payments: {
        where: { status: 'COMPLETED' },
      },
    },
  });

  if (!user) throw new Error('User not found');

  const subjectScores: Record<string, { scores: number[]; totalQuestions: number; correctAnswers: number }> = {};

  for (const result of user.cbtResults) {
    if (!subjectScores[result.subject]) {
      subjectScores[result.subject] = { scores: [], totalQuestions: 0, correctAnswers: 0 };
    }
    subjectScores[result.subject].scores.push(result.score);
    subjectScores[result.subject].totalQuestions += result.totalQuestions;
    subjectScores[result.subject].correctAnswers += result.correctAnswers;
  }

  const subjects = Object.entries(subjectScores).map(([subject, data]) => {
    const average = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    return {
      subject,
      averageScore: Math.round(average),
      grade: getGrade(average),
      attempts: data.scores.length,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
    };
  });

  const overallAverage = subjects.length > 0
    ? subjects.reduce((sum, s) => sum + s.averageScore, 0) / subjects.length
    : 0;

  const transcript = {
    studentInfo: {
      name: user.fullName,
      studentId: user.portalId,
      programme: user.programme,
      classLevel: user.classLevel,
      dateOfBirth: user.dateOfBirth,
      currentSchool: user.currentSchool,
    },
    academicSession: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    subjects,
    overallAverage: Math.round(overallAverage),
    overallGrade: getGrade(overallAverage),
    totalCBTs: user.cbtResults.length,
    totalPayments: user.payments.length,
    generatedAt: new Date(),
  };

  // Save transcript
  await prisma.transcript.create({
    data: {
      userId,
      academicSession: transcript.academicSession,
      data: transcript as any,
    },
  });

  return transcript;
}

export async function getTranscripts(userId: string) {
  return prisma.transcript.findMany({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
  });
}

function getGrade(score: number): string {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}
