import { prisma } from '../lib/prisma';

interface UploadDocumentParams {
  userId: string;
  name: string;
  type: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

export async function uploadDocument(params: UploadDocumentParams) {
  return prisma.document.create({
    data: {
      userId: params.userId,
      name: params.name,
      type: params.type,
      fileUrl: params.fileUrl,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      status: 'PENDING',
    },
  });
}

export async function getUserDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
  });
}

export async function getDocumentsByStatus(status: string) {
  return prisma.document.findMany({
    where: { status },
    include: {
      user: {
        select: { fullName: true, portalId: true, email: true },
      },
    },
    orderBy: { uploadedAt: 'desc' },
  });
}

export async function reviewDocument(documentId: string, status: string, reviewNote?: string, reviewedBy?: string) {
  return prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      reviewNote,
      reviewedBy,
      reviewedAt: new Date(),
    },
  });
}

export async function deleteDocument(documentId: string, userId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!doc) throw new Error('Document not found');

  return prisma.document.delete({
    where: { id: documentId },
  });
}
