import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { upload } from '../lib/upload';

const router = Router();

router.post('/image', authenticate, authorize('ADMIN'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = (req.body.folder as string) || 'uploads';
    const result = await uploadToCloudinary(req.file.buffer, folder, 'image');

    res.json({ success: true, data: { url: result.url } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

export default router;
