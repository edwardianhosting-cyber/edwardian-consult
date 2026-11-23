import { prisma } from '../lib/prisma';

export async function createTimetableEntry(data: {
  day: string;
  time: string;
  subject: string;
  instructor?: string;
  venue?: string;
  type?: string;
  examType?: string;
  classLevel?: string;
}) {
  return prisma.timetableEntry.create({
    data: {
      day: data.day,
      time: data.time,
      subject: data.subject,
      instructor: data.instructor,
      venue: data.venue,
      type: data.type || 'CLASS',
      examType: data.examType,
      classLevel: data.classLevel,
    },
  });
}

export async function getAllTimetableEntries() {
  return prisma.timetableEntry.findMany({
    orderBy: [{ day: 'asc' }, { time: 'asc' }],
  });
}

export async function getTimetableByExamType(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      examTypes: true,
      classLevel: true,
      jambSubjects: true,
      programme: true,
    },
  });

  if (!user) return [];

  const userExamTypes = (Array.isArray(user.examTypes) ? user.examTypes : (user.examTypes ? JSON.parse(JSON.stringify(user.examTypes)) : [])) as string[];
  const userSubjects = (Array.isArray(user.jambSubjects) ? user.jambSubjects : (user.jambSubjects ? JSON.parse(JSON.stringify(user.jambSubjects)) : [])) as string[];

  const entries = await prisma.timetableEntry.findMany({
    where: {
      OR: [
        { examType: { in: userExamTypes } },
        { examType: null },
        { examType: '' },
        { examType: 'All' },
      ],
    },
    orderBy: [{ day: 'asc' }, { time: 'asc' }],
  });

  return entries.filter((entry) => {
    if (!entry.subject) return true;
    if (userSubjects.length === 0) return true;

    const entryParts = entry.subject
      .split('/')
      .map((s) => s.toLowerCase().trim())
      .filter(Boolean);

    return userSubjects.some((userSubject) => {
      const userLower = userSubject.toLowerCase();
      return entryParts.some(
        (part) =>
          userLower.includes(part) ||
          part.includes(userLower) ||
          userLower === part
      );
    });
  });
}

export async function updateTimetableEntry(id: string, data: any) {
  return prisma.timetableEntry.update({
    where: { id },
    data,
  });
}

export async function deleteTimetableEntry(id: string) {
  await prisma.timetableEntry.delete({ where: { id } });
}
