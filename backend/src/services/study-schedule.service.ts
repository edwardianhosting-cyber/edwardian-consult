import { prisma } from '../lib/prisma';

export async function createStudySchedule(userId: string, data: {
  title: string;
  description?: string;
  subject: string;
  topic?: string;
  scheduledAt: string;
  durationMinutes?: number;
  reminderEnabled?: boolean;
}) {
  return prisma.studySchedule.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      subject: data.subject,
      topic: data.topic,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes || 30,
      reminderEnabled: data.reminderEnabled ?? true,
    },
  });
}

export async function getMyStudySchedules(userId: string) {
  return prisma.studySchedule.findMany({
    where: { userId },
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function updateStudySchedule(userId: string, scheduleId: string, data: any) {
  const schedule = await prisma.studySchedule.findFirst({
    where: { id: scheduleId, userId },
  });

  if (!schedule) throw new Error('Schedule not found');

  return prisma.studySchedule.update({
    where: { id: scheduleId },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });
}

export async function deleteStudySchedule(userId: string, scheduleId: string) {
  const schedule = await prisma.studySchedule.findFirst({
    where: { id: scheduleId, userId },
  });

  if (!schedule) throw new Error('Schedule not found');

  await prisma.studySchedule.delete({ where: { id: scheduleId } });
}

export async function completeStudySchedule(userId: string, scheduleId: string) {
  const schedule = await prisma.studySchedule.findFirst({
    where: { id: scheduleId, userId },
  });

  if (!schedule) throw new Error('Schedule not found');

  return prisma.studySchedule.update({
    where: { id: scheduleId },
    data: { isCompleted: true, completedAt: new Date() },
  });
}

export async function getDueSchedules() {
  const now = new Date();
  const inFiveMinutes = new Date(now.getTime() + 5 * 60 * 1000);

  return prisma.studySchedule.findMany({
    where: {
      isCompleted: false,
      reminderEnabled: true,
      scheduledAt: {
        gte: now.toISOString(),
        lte: inFiveMinutes.toISOString(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
