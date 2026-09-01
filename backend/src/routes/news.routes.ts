import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../lib/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { slugify } from '../lib/utils';
import { notifyAnnouncement, createBulkNotifications } from '../services/notification.service';
import { sendEmail } from '../lib/email';

const router = Router();

// Get all published news
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, targetType } = req.query;

    const where: any = { isPublished: true, isActive: true };
    if (category) {
      where.category = category;
    }
    if (targetType) {
      where.targetType = targetType;
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          excerpt: true,
          coverImage: true,
          isPinned: true,
          viewCount: true,
          createdAt: true,
        },
      }),
      prisma.newsArticle.count({ where }),
    ]);

    return res.json({
      success: true,
      data: articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw error;
  }
});

// Get single news article
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const article = await prisma.newsArticle.findFirst({
      where: {
        slug: req.params.slug,
        isPublished: true,
        isActive: true,
      },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Increment view count
    await prisma.newsArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Create news article
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const articleSchema = z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
      isPublished: z.boolean().default(true),
      isPinned: z.boolean().default(false),
      targetType: z.string().default('ALL'),
      targetFilter: z.string().optional().nullable(),
    });

    const validated = articleSchema.parse(req.body);

    const slug = slugify(validated.title);

    const article = await prisma.newsArticle.create({
      data: {
        ...validated,
        slug,
        authorId: (req as any).user.userId,
      },
    });

    // Trigger notifications and emails for matching students
    const studentWhere: any = { role: 'STUDENT' };
    if (validated.targetType === 'JAMB') {
      studentWhere.programme = 'JAMB';
    } else if (validated.targetType === 'WAEC') {
      studentWhere.programme = 'WAEC';
    } else if (validated.targetType === 'NECO') {
      studentWhere.programme = 'NECO';
    }

    const targetStudents = await prisma.user.findMany({
      where: studentWhere,
      select: { id: true, email: true, studentEmail: true, fullName: true },
    });

    if (targetStudents.length > 0) {
      await createBulkNotifications(
        targetStudents.map(s => s.id),
        validated.title,
        validated.excerpt || validated.content.slice(0, 200),
        'ANNOUNCEMENT',
        {
          link: `/student/news/${article.slug}`,
          entityType: 'NEWS',
          entityId: article.id,
          channels: ['DASHBOARD', 'EMAIL'],
          emailPurpose: 'REGISTRAR',
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article,
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Update news article
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const updateSchema = z.object({
      title: z.string().optional(),
      category: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
      isPublished: z.boolean().optional(),
      isPinned: z.boolean().optional(),
      targetType: z.string().optional(),
      targetFilter: z.string().optional().nullable(),
    });

    const validated = updateSchema.parse(req.body);

    const data: any = { ...validated };
    if (validated.title) {
      data.slug = slugify(validated.title);
    }

    const article = await prisma.newsArticle.update({
      where: { id: req.params.id },
      data,
    });

    return res.json({
      success: true,
      message: 'Article updated successfully',
      data: article,
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Delete news article
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.newsArticle.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Get all articles (including unpublished)
router.get('/admin/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.newsArticle.count(),
    ]);

    return res.json({
      success: true,
      data: articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw error;
  }
});

// Get categories with counts
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.newsArticle.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
