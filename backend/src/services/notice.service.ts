import { prisma } from '../lib/prisma';

interface CreateNoticeParams {
  title: string;
  content: string;
  type: string;
  targetType: string;
  targetFilter?: any;
  isPinned?: boolean;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
}

export async function createNotice(params: CreateNoticeParams) {
  return prisma.notice.create({
    data: {
      title: params.title,
      content: params.content,
      type: params.type,
      targetType: params.targetType,
      targetFilter: params.targetFilter,
      isPinned: params.isPinned ?? false,
      startDate: params.startDate,
      endDate: params.endDate,
      createdById: params.createdById,
    },
  });
}

export async function getActiveNotices(userId?: string) {
  const now = new Date();
  
  const notices = await prisma.notice.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  if (!userId) return notices;

  // Filter by target if userId provided
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return notices;

  return notices.filter(notice => {
    if (notice.targetType === 'ALL') return true;
    if (notice.targetType === 'JAMB' && user.programme === 'JAMB') return true;
    if (notice.targetType === 'WAEC' && user.programme === 'WAEC') return true;
    if (notice.targetType === 'NECO' && user.programme === 'NECO') return true;
    if (notice.targetType === 'SS3' && user.classLevel === 'SS3') return true;
    return false;
  });
}

export async function getNotices(page = 1, limit = 20) {
  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notice.count(),
  ]);

  return {
    notices,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateNotice(noticeId: string, data: Partial<CreateNoticeParams>) {
  return prisma.notice.update({
    where: { id: noticeId },
    data,
  });
}

export async function deleteNotice(noticeId: string) {
  return prisma.notice.delete({
    where: { id: noticeId },
  });
}
