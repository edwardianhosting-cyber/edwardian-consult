import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
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
} from '../services/study-material.service';

const router = Router();

const storage = multer({ storage: multer.memoryStorage() });
const upload = multer({ storage: multer.memoryStorage() });

// Subjects
router.get('/subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const subjects = await getStudySubjects();
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
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

    const fileType = req.body.type as 'pdf' | 'word' | 'video' | 'audio';
    if (!['pdf', 'word', 'video', 'audio'].includes(fileType)) {
      return res.status(400).json({ success: false, message: 'Invalid file type' });
    }

    const result = await uploadStudyMaterialFile(req.file, fileType);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
});

// Get all study materials (student view)
router.get('/materials', authenticate, async (req: Request, res: Response) => {
  try {
    const materials = await getAllStudyMaterials();
    const formatted = materials.map((m: any) => ({
      id: m.id,
      title: m.title,
      subject: m.topic?.subject?.name || 'General',
      type: m.type,
      fileUrl: m.fileUrl,
      description: m.content,
      createdAt: m.createdAt,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
});

export default router;
