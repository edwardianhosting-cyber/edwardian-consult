import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from './cloudinary.service';

export async function createStudySubject(data: {
  name: string;
  description?: string;
  code?: string;
  gradeLevel?: string;
  icon?: string;
  imageUrl?: string;
}) {
  return prisma.studySubject.create({
    data,
  });
}

export async function getStudySubjects(filters?: { isActive?: boolean; gradeLevel?: string }) {
  const where: any = {};
  if (filters?.isActive !== undefined) where.isActive = filters.isActive;
  if (filters?.gradeLevel) where.gradeLevel = filters.gradeLevel;

  return prisma.studySubject.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      topics: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          resources: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
}

export async function getStudySubjectById(id: string) {
  return prisma.studySubject.findUnique({
    where: { id },
    include: {
      topics: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          resources: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
}

export async function updateStudySubject(id: string, data: any) {
  return prisma.studySubject.update({
    where: { id },
    data,
  });
}

export async function deleteStudySubject(id: string) {
  return prisma.studySubject.delete({
    where: { id },
  });
}

export async function createStudyTopic(data: {
  subjectId: string;
  name: string;
  description?: string;
  order?: number;
}) {
  return prisma.studyTopic.create({
    data,
  });
}

export async function getStudyTopicsBySubject(subjectId: string) {
  return prisma.studyTopic.findMany({
    where: { subjectId, isActive: true },
    orderBy: { order: 'asc' },
    include: {
      resources: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function updateStudyTopic(id: string, data: any) {
  return prisma.studyTopic.update({
    where: { id },
    data,
  });
}

export async function deleteStudyTopic(id: string) {
  return prisma.studyTopic.delete({
    where: { id },
  });
}

export async function createStudyResource(data: {
  topicId: string;
  title: string;
  type: string;
  content?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  order?: number;
}) {
  return prisma.studyResource.create({
    data,
  });
}

export async function getStudyResourcesByTopic(topicId: string) {
  return prisma.studyResource.findMany({
    where: { topicId, isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getStudyResourceById(id: string) {
  return prisma.studyResource.findUnique({
    where: { id },
  });
}

export async function updateStudyResource(id: string, data: any) {
  return prisma.studyResource.update({
    where: { id },
    data,
  });
}

export async function deleteStudyResource(id: string) {
  return prisma.studyResource.delete({
    where: { id },
  });
}

export async function uploadStudyMaterialFile(file: Express.Multer.File, type: 'pdf' | 'word' | 'video' | 'audio'): Promise<{ url: string; textContent?: string; imageUrl?: string }> {
  let resourceType: 'image' | 'auto' | 'video' | 'raw' = 'auto';
  let eager: any[] | undefined;

  if (type === 'pdf') {
    resourceType = 'raw';
    eager = [
      { format: 'jpg', quality: 'auto', width: 800, crop: 'limit' },
    ];
  } else if (type === 'word') {
    resourceType = 'raw';
  } else if (type === 'video' || type === 'audio') {
    resourceType = 'video';
  }

  const result = await uploadToCloudinary(file.buffer, 'study-materials', resourceType, eager);
  const url = result.url;

  let textContent: string | undefined;

  if (type === 'pdf') {
    try {
      const pdfParse = await import('pdf-parse');
      const data = await (pdfParse.default || pdfParse)(file.buffer);
      textContent = data.text;
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      textContent = '';
    }
  } else if (type === 'word') {
    try {
      const mammoth = await import('mammoth');
      const extractResult = await mammoth.extractRawText({ buffer: file.buffer });
      textContent = extractResult.value;
    } catch (error) {
      console.error('Word text extraction failed:', error);
      textContent = '';
    }
  }

  let imageUrl: string | undefined;
  if (type === 'pdf' && result.eager && result.eager.length > 0) {
    imageUrl = result.eager[0]?.secure_url;
  }

  return { url, textContent, imageUrl };
}

export async function getAllStudyMaterials() {
  return prisma.studyResource.findMany({
    where: { isActive: true },
    include: {
      topic: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
