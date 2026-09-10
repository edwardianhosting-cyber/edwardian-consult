import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { uploadQuestionImage, bulkCreateQuestionsFromCSV, bulkCreateQuestionsFromExcel, bulkCreateQuestionsFromJSON } from '../services/question.service';
import { upload } from '../lib/upload';

const router = Router();

// Create single question
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      subject: z.string().min(1),
      examType: z.string().min(1),
      institution: z.string().optional().nullable(),
      year: z.number().int().optional(),
      topic: z.string().optional().nullable(),
      text: z.string().min(1),
      imageUrl: z.string().optional().nullable(),
      options: z.array(z.string()).min(2),
      correctOption: z.number().int(),
      explanation: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    });

    const validated = schema.parse(req.body);
    const question = await prisma.question.create({
      data: {
        subject: validated.subject,
        examType: validated.examType,
        institution: validated.institution || null,
        year: validated.year || 0,
        topic: validated.topic || null,
        text: validated.text,
        imageUrl: validated.imageUrl || null,
        options: validated.options,
        correctOption: validated.correctOption,
        explanation: validated.explanation || null,
        isActive: validated.isActive ?? true,
      },
    });
    return res.status(201).json({ success: true, data: question });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create question' });
  }
});

// Update question
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      subject: z.string().optional(),
      examType: z.string().optional(),
      institution: z.string().optional().nullable(),
      year: z.number().int().optional(),
      topic: z.string().optional().nullable(),
      text: z.string().optional(),
      imageUrl: z.string().optional().nullable(),
      options: z.array(z.string()).optional(),
      correctOption: z.number().int().optional(),
      explanation: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    });

    const validated = schema.parse(req.body);
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: validated,
    });
    return res.json({ success: true, data: question });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update question' });
  }
});

// Delete question
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Question deleted' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete question' });
  }
});

router.get('/sample', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const sampleData = [
      { question: 'What is the capital of Nigeria?', options: 'Lagos|Abuja|Kano|Port Harcourt', answer: 1, explanation: 'Abuja is the capital city of Nigeria.', imageUrl: '' },
      { question: 'Solve for x: 2x + 5 = 13', options: 'x = 3|x = 4|x = 5|x = 6', answer: 1, explanation: '2x = 8, so x = 4', imageUrl: '' },
    ];

    const format = String(req.query.format || 'excel').toLowerCase();

    if (format === 'csv') {
      const headers = Object.keys(sampleData[0]).join(',');
      const rows = sampleData.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
      const csv = [headers, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="questions-sample.csv"');
      return res.send(csv);
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="questions-sample.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate sample file' });
  }
});

router.post('/upload-image', authenticate, authorize('ADMIN'), upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const result = await uploadQuestionImage(req.file);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

router.post('/bulk-upload', authenticate, authorize('ADMIN'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const defaults = {
      subject: req.body.subject,
      examType: req.body.examType,
      institution: req.body.institution,
      year: req.body.year ? parseInt(req.body.year, 10) : undefined,
      topic: req.body.topic,
    };

    const fileName = req.file.originalname.toLowerCase();
    let result;

    if (fileName.endsWith('.csv')) {
      const csvText = req.file.buffer.toString('utf-8');
      result = await bulkCreateQuestionsFromCSV(csvText, defaults);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      result = await bulkCreateQuestionsFromExcel(req.file.buffer, defaults);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload CSV or Excel file.' });
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process file' });
  }
});

router.post('/bulk-upload-json', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { questions, defaults } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Questions array is required' });
    }

    const result = await bulkCreateQuestionsFromJSON(questions, defaults);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process JSON questions' });
  }
});

export default router;
