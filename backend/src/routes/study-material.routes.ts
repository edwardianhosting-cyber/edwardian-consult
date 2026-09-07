import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
import prisma from '../lib/prisma';
import {
  createStudySubject,
  getStudySubjects,
  getStudySubjectById,
  updateStudySubject,
  deleteStudySubject,
  createStudyTopic,
  getStudyTopicsBySubject,
  updateStudyTopic,
  deleteStudyTopic,
  createStudyResource,
  getStudyResourcesByTopic,
  getStudyResourceById,
  updateStudyResource,
  deleteStudyResource,
  uploadStudyMaterialFile,
  getAllStudyMaterials,
  uploadSyllabus,
  uploadSyllabusText,
  bulkUploadTopics,
  bulkUploadTopicsFromJson,
} from '../services/study-material.service';
import { getFileCategory, saveBufferToDisk } from '../lib/local-file-storage';

const router = Router();

const storage = multer({ storage: multer.memoryStorage() });
const upload = multer({ storage: multer.memoryStorage() });

// Subjects
router.get('/subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const subjects = await getStudySubjects({
      isActive: req.query.isActive === 'false' ? false : req.query.isActive === 'true' ? true : undefined,
      examType: req.query.examType as string | undefined,
    });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
});

router.get('/subjects/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const subject = await getStudySubjectById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subject' });
  }
});

router.post('/subjects', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const subject = await createStudySubject(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create subject' });
  }
});

router.put('/subjects/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const subject = await updateStudySubject(req.params.id, req.body);
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update subject' });
  }
});

router.delete('/subjects/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    await deleteStudySubject(req.params.id);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete subject' });
  }
});

router.post('/subjects/:subjectId/syllabus', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No syllabus file provided' });
    }

    const subjectId = req.params.subjectId;
    const subject = await getStudySubjectById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const result = await uploadSyllabus(req.file, subjectId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Syllabus upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload syllabus' });
  }
});

router.post('/subjects/:subjectId/syllabus-text', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const { text, examType } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Syllabus text is required' });
    }

    const subjectId = req.params.subjectId;
    const subject = await getStudySubjectById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const result = await uploadSyllabusText(text, subjectId, examType);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Syllabus text upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload syllabus text' });
  }
});

router.post('/subjects/:subjectId/topics/csv', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file provided' });
    }

    const subjectId = req.params.subjectId;
    const subject = await getStudySubjectById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const examType = req.body.examType;
    const topics = await bulkUploadTopics(subjectId, csvText, examType);
    res.status(201).json({ success: true, data: topics });
  } catch (error) {
    console.error('Topics CSV upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload topics from CSV' });
  }
});

router.post('/subjects/:subjectId/topics/json', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const { topics, examType } = req.body;
    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ success: false, message: 'Topics array is required' });
    }

    const subjectId = req.params.subjectId;
    const subject = await getStudySubjectById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const createdTopics = await bulkUploadTopicsFromJson(subjectId, topics, examType);
    res.status(201).json({ success: true, data: createdTopics });
  } catch (error) {
    console.error('Topics JSON upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload topics from JSON' });
  }
});

// Topics
router.get('/subjects/:subjectId/topics', authenticate, async (req: Request, res: Response) => {
  try {
    const topics = await getStudyTopicsBySubject(req.params.subjectId);
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch topics' });
  }
});

router.post('/topics', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const topic = await createStudyTopic(req.body);
    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create topic' });
  }
});

router.put('/topics/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const topic = await updateStudyTopic(req.params.id, req.body);
    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update topic' });
  }
});

router.delete('/topics/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    await deleteStudyTopic(req.params.id);
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete topic' });
  }
});

// Resources
router.get('/topics/:topicId/resources', authenticate, async (req: Request, res: Response) => {
  try {
    const resources = await getStudyResourcesByTopic(req.params.topicId);
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
});

router.get('/resources/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resource = await getStudyResourceById(req.params.id);
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resource' });
  }
});

router.post('/resources', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const resource = await createStudyResource(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create resource' });
  }
});

router.put('/resources/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const resource = await updateStudyResource(req.params.id, req.body);
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update resource' });
  }
});

router.delete('/resources/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    await deleteStudyResource(req.params.id);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resource' });
  }
});

// File upload
router.post('/upload', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const fileType = req.body.type as 'pdf' | 'word' | 'video' | 'audio' | 'image';
    if (!['pdf', 'word', 'video', 'audio', 'image'].includes(fileType)) {
      return res.status(400).json({ success: false, message: 'Invalid file type' });
    }

    const category = getFileCategory(req.file.mimetype);
    const useCloudinary = fileType === 'pdf' || fileType === 'word';
    let url = '';
    let textContent: string | undefined;
    let imageUrl: string | undefined;

    if (useCloudinary) {
      const result = await uploadStudyMaterialFile(req.file, fileType);
      url = result.url;
      textContent = result.textContent;
      imageUrl = result.imageUrl;
    } else {
      const localCategory = category === 'other' ? 'other' : category;
      url = saveBufferToDisk(req.file.buffer, req.file.mimetype, localCategory as 'image' | 'video' | 'audio');
    }

    let resource: any = null;
    const topicId = req.body.topicId as string | undefined;
    const title = req.body.title as string | undefined;
    const description = req.body.description as string | undefined;

    if (topicId && title) {
      resource = await createStudyResource({
        topicId,
        title,
        type: fileType.toUpperCase(),
        content: description || textContent || undefined,
        fileUrl: url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        imageUrl,
      });
    }

    res.status(201).json({ success: true, data: { url, textContent, imageUrl, resource } });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
});

// Get all study materials (student view)
router.get('/materials', authenticate, async (req: Request, res: Response) => {
  try {
    // If the requester is a student, filter by their registered subjects.
    // Materials are linked to StudySubject via StudyTopic. We match the
    // StudySubject.name against the student's jambSubjects strings.
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { jambSubjects: true, role: true },
    });

    const userSubjects = (user?.jambSubjects as string[]) || [];
    const isStudent = user?.role === 'STUDENT';

    const where: any = { isActive: true };

    if (isStudent && userSubjects.length > 0) {
      where.topic = {
        subject: { name: { in: userSubjects } },
      };
    }

    const materials = await prisma.studyResource.findMany({
      where,
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = materials.map((m: any) => ({
      id: m.id,
      title: m.title,
      subject: m.topic?.subject?.name || 'General',
      type: m.type,
      fileUrl: m.fileUrl,
      imageUrl: m.imageUrl,
      textContent: m.textContent,
      description: m.content,
      createdAt: m.createdAt,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
});

router.get('/materials/hierarchy', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { jambSubjects: true, role: true },
    });

    const userSubjects = (user?.jambSubjects as string[]) || [];
    const isStudent = user?.role === 'STUDENT';

    const where: any = { isActive: true };
    if (req.query.examType) {
      where.examType = req.query.examType as string;
    }
    if (isStudent && userSubjects.length > 0) {
      where.name = { in: userSubjects };
    }

    const subjects = await prisma.studySubject.findMany({
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

    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Failed to fetch materials hierarchy:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch materials hierarchy' });
  }
});

export default router;
