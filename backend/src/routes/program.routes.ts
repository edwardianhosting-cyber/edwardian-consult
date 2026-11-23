import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Get all active programs (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all programs including inactive (admin only)
router.get('/admin/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single program by slug (public)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const program = await prisma.program.findUnique({
      where: { slug: req.params.slug },
    });
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.json({ success: true, data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create program (admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, description, features, icon, imageUrl, price, duration, order } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const program = await prisma.program.create({
      data: {
        title,
        slug,
        description,
        features: features || [],
        icon,
        imageUrl,
        price,
        duration,
        order: order || 0,
      },
    });
    res.status(201).json({ success: true, data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update program (admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, description, features, icon, imageUrl, price, duration, isActive, order } = req.body;
    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        features: features || [],
        icon,
        imageUrl,
        price,
        duration,
        isActive,
        order,
      },
    });
    res.json({ success: true, data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete program (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.program.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Program deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
