import { Router, Request, Response } from 'express';
import { authenticate, authorize, parentReadOnly } from '../middleware/auth.middleware';
import {
  uploadDocument,
  getUserDocuments,
  getDocumentsByStatus,
  reviewDocument,
  deleteDocument,
} from '../services/document.service';

const router = Router();

// Upload document
router.post('/', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }
    const document = await uploadDocument({
      userId: req.user!.userId,
      ...req.body,
    });
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
});

// Get user documents
router.get('/my', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const documents = await getUserDocuments(req.user!.userId);
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

// Get documents by status (Admin)
router.get('/review/:status', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const documents = await getDocumentsByStatus(req.params.status);
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

// Review document (Admin)
router.patch('/:id/review', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const document = await reviewDocument(
      req.params.id,
      req.body.status,
      req.body.note,
      req.user!.userId
    );
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to review document' });
  }
});

// Delete document
router.delete('/:id', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }
    await deleteDocument(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
});

export default router;
