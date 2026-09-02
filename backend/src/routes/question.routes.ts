import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { uploadQuestionImage, bulkCreateQuestionsFromCSV, bulkCreateQuestionsFromExcel } from '../services/question.service';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// Update question
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      subject: z.string().optional(),
      examType: z.string().optional(),
      institution: z.string().optional().nullable(),
      year: z.number().int().optional(),
      topic: z.string().optional().nullable(),
      difficulty: z.string().optional(),
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
router.delete('/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
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
      { subject: 'Mathematics', examType: 'JAMB', institution: 'UI', year: 2024, topic: 'Algebra', difficulty: 'MEDIUM', text: 'What is the value of x in 2x + 5 = 15?', options: '7|8|9|10', correctOption: 1, explanation: 'Subtract 5 from both sides then divide by 2' },
      { subject: 'English', examType: 'WAEC', institution: 'NECO', year: 2023, topic: 'Grammar', difficulty: 'EASY', text: 'Choose the correct option: She ___ to school every day.', options: 'go|goes|going|gone', correctOption: 1, explanation: 'Third person singular present tense adds -es' },
      { subject: 'Physics', examType: 'POST-UTME', institution: 'UNILAG', year: 2024, topic: 'Electricity', difficulty: 'HARD', text: 'Calculate the current in a circuit with 10V and 5Ω.', options: '1A|2A|3A|4A', correctOption: 1, explanation: "Ohm's Law: I = V/R = 10/5 = 2A" },
      { subject: 'Chemistry', examType: 'JAMB', institution: 'OAU', year: 2023, topic: 'Organic Chemistry', difficulty: 'MEDIUM', text: 'What is the molecular formula of Ethane?', options: 'C2H4|C2H6|C3H8|CH4', correctOption: 1, explanation: 'Ethane has 2 carbons and 6 hydrogens' },
    ];

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

router.post('/upload-image', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), upload.single('image'), async (req: Request, res: Response) => {
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

router.post('/bulk-upload', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const fileName = req.file.originalname.toLowerCase();
    let result;

    if (fileName.endsWith('.csv')) {
      const csvText = req.file.buffer.toString('utf-8');
      result = await bulkCreateQuestionsFromCSV(csvText);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      result = await bulkCreateQuestionsFromExcel(req.file.buffer);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload CSV or Excel file.' });
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process file' });
  }
});

export default router;
