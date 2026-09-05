import { prisma } from '../lib/prisma';

export async function getAdmissionAnnouncements(filters?: { category?: string; published?: boolean }) {
  const where: any = {};
  if (filters?.category) where.category = filters.category;
  if (filters?.published !== undefined) where.isPublished = filters.published;
  where.isActive = true;

  return prisma.admissionAnnouncement.findMany({
    where,
    orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
  });
}

export async function getAdmissionAnnouncement(id: string) {
  return prisma.admissionAnnouncement.findUnique({ where: { id } });
}

export async function createAdmissionAnnouncement(data: {
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  category?: string;
  isPublished?: boolean;
  isPinned?: boolean;
  authorId?: string;
}) {
  return prisma.admissionAnnouncement.create({
    data: {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      image: data.image,
      category: data.category || 'GENERAL',
      isPublished: data.isPublished ?? true,
      isPinned: data.isPinned ?? false,
      authorId: data.authorId,
      publishedAt: data.isPublished ? new Date() : undefined,
    },
  });
}

export async function updateAdmissionAnnouncement(id: string, data: {
  title?: string;
  content?: string;
  excerpt?: string;
  image?: string;
  category?: string;
  isPublished?: boolean;
  isPinned?: boolean;
}) {
  const updateData: any = { ...data };
  if (data.isPublished && !data.isPinned) {
    updateData.publishedAt = new Date();
  }
  return prisma.admissionAnnouncement.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteAdmissionAnnouncement(id: string) {
  return prisma.admissionAnnouncement.update({
    where: { id },
    data: { isActive: false },
  });
}
