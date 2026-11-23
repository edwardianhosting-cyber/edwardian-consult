import { prisma } from '../lib/prisma';

export async function markAttendance(userId: string, type: 'CHECK_IN' | 'CHECK_OUT') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.attendanceLog.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  if (type === 'CHECK_IN') {
    if (existingLog?.checkIn) {
      throw new Error('Already checked in today');
    }

    if (existingLog) {
      return prisma.attendanceLog.update({
        where: { id: existingLog.id },
        data: { checkIn: new Date(), status: 'PRESENT' },
      });
    }

    return prisma.attendanceLog.create({
      data: {
        userId,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT',
      },
    });
  }

  if (type === 'CHECK_OUT') {
    if (!existingLog) {
      throw new Error('Must check in first');
    }
    if (existingLog.checkOut) {
      throw new Error('Already checked out today');
    }

    return prisma.attendanceLog.update({
      where: { id: existingLog.id },
      data: { checkOut: new Date() },
    });
  }
}

export async function markAttendanceByQR(portalId: string) {
  const user = await prisma.user.findUnique({ where: { portalId } });
  if (!user) throw new Error('Student not found');

  const hour = new Date().getHours();
  const type = hour < 12 ? 'CHECK_IN' : 'CHECK_OUT';

  return markAttendance(user.id, type);
}

export async function getAttendanceLog(userId: string, startDate?: Date, endDate?: Date) {
  const where: any = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  return prisma.attendanceLog.findMany({
    where,
    orderBy: { date: 'desc' },
  });
}

export async function getAttendanceStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const logs = await prisma.attendanceLog.findMany({
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const present = logs.filter(l => l.status === 'PRESENT').length;
  const late = logs.filter(l => l.status === 'LATE').length;
  const absent = logs.filter(l => l.status === 'ABSENT').length;

  return {
    present,
    late,
    absent,
    total: present + late + absent,
    attendanceRate: Math.round((present / (present + late + absent || 1)) * 100),
  };
}

export async function getAllAttendance(date?: Date) {
  const targetDate = date || new Date();
  targetDate.setHours(0, 0, 0, 0);

  return prisma.attendanceLog.findMany({
    where: {
      date: {
        gte: targetDate,
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      user: {
        select: { fullName: true, portalId: true, programme: true },
      },
    },
    orderBy: { checkIn: 'desc' },
  });
}
