import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all active sections with cards (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const sections = await prisma.contactSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        cards: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    res.json({ success: true, data: sections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all sections including inactive (admin only)
router.get('/admin/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const sections = await prisma.contactSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        cards: {
          orderBy: { order: 'asc' },
        },
      },
    });
    res.json({ success: true, data: sections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create section (admin only)
router.post('/sections', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, order } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const section = await prisma.contactSection.create({
      data: { title, slug, order: order || 0 },
    });
    res.status(201).json({ success: true, data: section });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update section (admin only)
router.put('/sections/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, order, isActive } = req.body;
    const section = await prisma.contactSection.update({
      where: { id: req.params.id },
      data: { title, order, isActive },
    });
    res.json({ success: true, data: section });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete section (admin only)
router.delete('/sections/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.contactSection.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Section deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create card (admin only)
router.post('/cards', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, description, icon, link, linkType, order, sectionId } = req.body;

    const card = await prisma.contactCard.create({
      data: {
        title,
        description,
        icon,
        link,
        linkType: linkType || 'url',
        order: order || 0,
        sectionId,
      },
    });
    res.status(201).json({ success: true, data: card });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update card (admin only)
router.put('/cards/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, description, icon, link, linkType, order, isActive } = req.body;
    const card = await prisma.contactCard.update({
      where: { id: req.params.id },
      data: { title, description, icon, link, linkType, order, isActive },
    });
    res.json({ success: true, data: card });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete card (admin only)
router.delete('/cards/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.contactCard.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Card deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
