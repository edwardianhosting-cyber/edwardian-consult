import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from './cloudinary.service';

export async function createStudySubject(data: {
  name: string;
  description?: string;
  code?: string;
  gradeLevel?: string;
  examType?: string;
  icon?: string;
  imageUrl?: string;
}) {
  return prisma.studySubject.create({
    data,
  });
}

export async function getStudySubjects(filters?: { isActive?: boolean; gradeLevel?: string; examType?: string }) {
  const where: any = {};
  if (filters?.isActive !== undefined) where.isActive = filters.isActive;
  if (filters?.gradeLevel) where.gradeLevel = filters.gradeLevel;
  if (filters?.examType) where.examType = filters.examType;

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
  examType?: string;
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
  imageUrl?: string;
  textContent?: string;
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

export async function uploadStudyMaterialFile(file: Express.Multer.File, type: 'pdf' | 'word' | 'video' | 'audio' | 'image'): Promise<{ url: string; textContent?: string; imageUrl?: string }> {
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

export async function uploadSyllabus(file: Express.Multer.File, subjectId: string) {
  let text = '';

  if (file.mimetype === 'application/pdf') {
    const pdfParse = await import('pdf-parse');
    const data = await (pdfParse.default || pdfParse)(file.buffer);
    text = data.text;
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    text = result.value;
  } else {
    text = file.buffer.toString('utf-8');
  }

  return parseSyllabusText(text, subjectId);
}

export async function uploadSyllabusText(text: string, subjectId: string, examType?: string) {
  return parseSyllabusText(text, subjectId, examType);
}

async function parseSyllabusText(text: string, subjectId: string, examType?: string) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const topicNames: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const cleaned = line
      .replace(/^#+\s*/, '')
      .replace(/^\d+[\.\)\-]\s*/, '')
      .replace(/^[A-Z][a-z]+[\.,]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();

    const meaningful = cleaned.length > 3 && cleaned.length < 120;
    const looksLikeHeading = /^[A-Z][A-Za-z0-9\-/, ]{2,}$/.test(cleaned) || /^(Topic|Unit|Week|Chapter)\s*\d*/i.test(cleaned);
    const isNotNoise = !/^(page|contents|table of contents|syllabus|subject|code|grade|teacher|time|venue|duration|notes|signature)/i.test(cleaned);

    if (meaningful && (looksLikeHeading || cleaned.length < 80) && isNotNoise) {
      const normalized = cleaned.replace(/^\d+[\.\)\-]\s*/, '').trim();
      if (!seen.has(normalized.toLowerCase())) {
        seen.add(normalized.toLowerCase());
        topicNames.push(normalized);
      }
    }
  }

  const topics: { id: string; name: string }[] = [];
  for (let i = 0; i < topicNames.length; i++) {
    const topic = await createStudyTopic({
      subjectId,
      name: topicNames[i],
      description: `Syllabus topic ${i + 1}`,
      examType,
      order: i,
    });
    topics.push({ id: topic.id, name: topic.name });
  }

  return { text, topics };
}

export async function bulkUploadTopics(subjectId: string, csvText: string, examType?: string) {
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const topics: { id: string; name: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim()).filter(Boolean);
    const name = parts[0] || `Topic ${i + 1}`;
    const description = parts[1] || '';

    const topic = await createStudyTopic({
      subjectId,
      name,
      description,
      examType,
      order: i,
    });
    topics.push({ id: topic.id, name: topic.name });
  }

  return topics;
}

export async function bulkUploadTopicsFromJson(subjectId: string, topics: Array<{ name: string; description?: string; examType?: string }>, examType?: string) {
  const createdTopics: { id: string; name: string }[] = [];

  for (let i = 0; i < topics.length; i++) {
    const topicData = topics[i];
    if (!topicData.name) continue;

    const topic = await createStudyTopic({
      subjectId,
      name: topicData.name,
      description: topicData.description || '',
      examType: topicData.examType || examType,
      order: i,
    });
    createdTopics.push({ id: topic.id, name: topic.name });
  }

  return createdTopics;
}
