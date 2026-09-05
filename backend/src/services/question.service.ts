import { prisma } from '../lib/prisma';
import { uploadToCloudinary } from './cloudinary.service';
import * as XLSX from 'xlsx';

export async function uploadQuestionImage(file: Express.Multer.File): Promise<{ url: string }> {
  const result = await uploadToCloudinary(file.buffer, 'questions', 'image');

  return {
    url: result.url,
  };
}

function parseQuestionRow(row: Record<string, any>, lineIndex: number, defaults?: {
  subject?: string;
  examType?: string;
  institution?: string;
  year?: number;
}): { data?: any; error?: string } | null {
  const subject = String(row.subject || row.Subject || row.SUBJECT || defaults?.subject || '').trim();
  const examType = String(row.examType || row.ExamType || row.EXAM_TYPE || row['Exam Type'] || defaults?.examType || '').trim();
  const institution = String(row.institution || row.Institution || row.INSTITUTION || defaults?.institution || '').trim();
  const yearStr = String(row.year || row.Year || row.YEAR || defaults?.year || '').trim();
  const text = String(row.question || row.text || row.Text || row.TEXT || '').trim();
  const options = String(row.options || row.Options || row.OPTIONS || '').trim();
  const correctOptionStr = String(row.answer || row.Answer || row.ANSWER || row.correctOption || row.CorrectOption || row.CORRECT_OPTION || row['Correct Option'] || '').trim();
  const explanation = String(row.explanation || row.Explanation || row.EXPLANATION || '').trim();
  const imageUrl = String(row.imageUrl || row.ImageUrl || row.IMAGE_URL || row['Image URL'] || '').trim();

  const finalSubject = subject || defaults?.subject;
  const finalExamType = examType || defaults?.examType;
  const finalInstitution = institution || defaults?.institution || '';
  const finalYear = yearStr ? parseInt(yearStr, 10) : (defaults?.year || 0);

  if (!finalSubject || !finalExamType || !finalYear || !text || !options || !correctOptionStr) {
    return { error: `Row ${lineIndex}: missing required fields` };
  }

  const correctOption = parseInt(correctOptionStr, 10);

  if (isNaN(correctOption)) {
    return { error: `Row ${lineIndex}: invalid correctOption` };
  }

  const optionsArray = options.split('|').map((opt: string) => opt.trim()).filter(Boolean);
  if (optionsArray.length < 2) {
    return { error: `Row ${lineIndex}: options must be pipe-separated (e.g., A|B|C|D)` };
  }

  if (correctOption < 0 || correctOption >= optionsArray.length) {
    return { error: `Row ${lineIndex}: correctOption must be between 0 and ${optionsArray.length - 1}` };
  }

  return {
    data: {
      subject: finalSubject,
      examType: finalExamType,
      institution: finalInstitution || undefined,
      year: finalYear,
      text,
      imageUrl: imageUrl || undefined,
      options: optionsArray,
      correctOption,
      explanation: explanation || undefined,
      isActive: true,
    },
  };
}

export async function bulkCreateQuestionsFromCSV(csvText: string, defaults?: {
  subject?: string;
  examType?: string;
  institution?: string;
  year?: number;
}): Promise<{ created: number; errors: string[] }> {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '' && !line.trim().startsWith('#'));
  let created = 0;
  const errors: string[] = [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const dataLines = lines.slice(1);

  for (let i = 0; i < dataLines.length; i++) {
    const values = dataLines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const parsed = parseQuestionRow(row, i + 2, defaults);
    if (parsed?.error) {
      errors.push(parsed.error);
      continue;
    }

    if (parsed?.data) {
      try {
        await prisma.question.create({ data: parsed.data });
        created += 1;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${(error as Error).message}`);
      }
    }
  }

  return { created, errors };
}

export async function bulkCreateQuestionsFromExcel(buffer: Buffer, defaults?: {
  subject?: string;
  examType?: string;
  institution?: string;
  year?: number;
}): Promise<{ created: number; errors: string[] }> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let created = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as Record<string, any>;
    const parsed = parseQuestionRow(row, i + 2, defaults);

    if (parsed?.error) {
      errors.push(parsed.error);
      continue;
    }

    if (parsed?.data) {
      try {
        await prisma.question.create({ data: parsed.data });
        created += 1;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${(error as Error).message}`);
      }
    }
  }

  return { created, errors };
}
