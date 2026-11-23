import { prisma } from '../lib/prisma';

function getNextOccurrence(dayOfWeek: string, time: string): Date {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let targetDay = days.indexOf(dayOfWeek);
  if (targetDay === -1) targetDay = 1;

  const now = new Date();
  const currentDay = now.getDay();
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(now);
  result.setHours(hours, minutes || 0, 0, 0);

  const diff = targetDay - currentDay;
  if (diff < 0 || (diff === 0 && result <= now)) {
    result.setDate(result.getDate() + 7 + diff);
  } else if (diff === 0) {
    result.setDate(result.getDate() + 7);
  } else {
    result.setDate(result.getDate() + diff);
  }

  return result;
}

export async function createStudySchedule(userId: string, data: {
  title: string;
  description?: string;
  subject: string;
  topic?: string;
  dayOfWeek: string;
  time: string;
  durationMinutes?: number;
  reminderEnabled?: boolean;
}) {
  const scheduledAt = getNextOccurrence(data.dayOfWeek, data.time);
  return prisma.studySchedule.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      subject: data.subject,
      topic: data.topic,
      dayOfWeek: data.dayOfWeek,
      time: data.time,
      scheduledAt,
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

  const updateData: any = { ...data };
  if (data.dayOfWeek || data.time) {
    const dayOfWeek = data.dayOfWeek || schedule.dayOfWeek;
    const time = data.time || schedule.time;
    updateData.dayOfWeek = dayOfWeek;
    updateData.time = time;
    updateData.scheduledAt = getNextOccurrence(dayOfWeek, time);
  }

  return prisma.studySchedule.update({
    where: { id: scheduleId },
    data: updateData,
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
