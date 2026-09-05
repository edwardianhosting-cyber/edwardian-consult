import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { generateTranscript, getTranscripts } from '../services/transcript.service';

const router = Router();

// Generate transcript
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const transcript = await generateTranscript(req.user!.userId);
    res.json({ success: true, data: transcript });
  } catch (error: any) {
    console.error('Transcript generation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate transcript' });
  }
});

// Get user transcripts
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const transcripts = await getTranscripts(req.user!.userId);
    res.json({ success: true, data: transcripts });
  } catch (error: any) {
    console.error('Transcript fetch error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch transcripts' });
  }
});

export default router;
