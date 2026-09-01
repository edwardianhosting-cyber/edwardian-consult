import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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

// Get all sections including inactive (admin)
router.get('/admin/all', async (req: Request, res: Response) => {
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

// Create section
router.post('/sections', async (req: Request, res: Response) => {
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

// Update section
router.put('/sections/:id', async (req: Request, res: Response) => {
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

// Delete section
router.delete('/sections/:id', async (req: Request, res: Response) => {
  try {
    await prisma.contactSection.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Section deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create card
router.post('/cards', async (req: Request, res: Response) => {
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

// Update card
router.put('/cards/:id', async (req: Request, res: Response) => {
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

// Delete card
router.delete('/cards/:id', async (req: Request, res: Response) => {
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
