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

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(current);
        current = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentLine.push(current);
        lines.push(currentLine);
        currentLine = [];
        current = '';
        if (char === '\r') i++;
      } else {
        current += char;
      }
    }
  }
  
  if (current || currentLine.length > 0) {
    currentLine.push(current);
    lines.push(currentLine);
  }
  
  return lines;
}

export async function bulkCreateQuestionsFromCSV(csvText: string, defaults?: {
  subject?: string;
  examType?: string;
  institution?: string;
  year?: number;
}): Promise<{ created: number; errors: string[] }> {
  const rows = parseCSV(csvText).filter(row => row.some(cell => cell.trim() !== '') && !row[0]?.trim().startsWith('#'));
  
  if (rows.length === 0) {
    return { created: 0, errors: ['No data rows found'] };
  }
  
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const dataRows = rows.slice(1);
  
  let created = 0;
  const errors: string[] = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const values = dataRows[i];
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

function normalizeQuestionItem(item: Record<string, any>, index: number, defaults?: {
  subject?: string;
  examType?: string;
  institution?: string;
  year?: number;
}): { data?: any; error?: string } | null {
  const subject = String(item.subject || item.Subject || item.SUBJECT || defaults?.subject || '').trim();
  const examType = String(item.examType || item.ExamType || item.EXAM_TYPE || item['Exam Type'] || defaults?.examType || '').trim();
  const institution = String(item.institution || item.Institution || item.INSTITUTION || defaults?.institution || '').trim();
  const yearStr = String(item.year || item.Year || item.YEAR || defaults?.year || '').trim();
  const text = String(item.text || item.question || item.Text || item.TEXT || item.question || '').trim();
  const optionsRaw = item.options || item.Options || item.OPTIONS || '';
  const options = Array.isArray(optionsRaw) ? optionsRaw : String(optionsRaw).split('|').map((o: string) => o.trim()).filter(Boolean);
  const correctOptionRaw = item.correctOption ?? item.correct_option ?? item.answer ?? item.Answer ?? item.CORRECT_OPTION ?? item['Correct Option'] ?? item.answer;
  const explanation = String(item.explanation || item.Explanation || item.EXPLANATION || '').trim();
  const imageUrl = String(item.imageUrl || item.ImageUrl || item.IMAGE_URL || item['Image URL'] || '').trim();

  const finalSubject = subject || defaults?.subject;
  const finalExamType = examType || defaults?.examType;
  const finalInstitution = institution || defaults?.institution || '';
  const finalYear = yearStr ? parseInt(yearStr, 10) : (defaults?.year || 0);

  if (!finalSubject || !finalExamType || !finalYear || !text || options.length < 2 || correctOptionRaw === undefined || correctOptionRaw === null || correctOptionRaw === '') {
    return { error: `Question ${index + 1}: missing required fields` };
  }

  const correctOption = typeof correctOptionRaw === 'number' ? correctOptionRaw : parseInt(String(correctOptionRaw), 10);

  if (isNaN(correctOption)) {
    return { error: `Question ${index + 1}: invalid correctOption` };
  }

  if (correctOption < 0 || correctOption >= options.length) {
    return { error: `Question ${index + 1}: correctOption must be between 0 and ${options.length - 1}` };
  }

  return {
    data: {
      subject: finalSubject,
      examType: finalExamType,
      institution: finalInstitution || undefined,
      year: finalYear,
      text,
      imageUrl: imageUrl || undefined,
      options,
      correctOption,
      explanation: explanation || undefined,
      isActive: true,
    },
  };
}

export async function bulkCreateQuestionsFromJSON(items: Record<string, any>[], defaults?: {
  subject?: string;
  examType?: string;
  institution?: string;
  year?: number;
}): Promise<{ created: number; errors: string[] }> {
  let created = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const parsed = normalizeQuestionItem(items[i], i, defaults);
    if (parsed?.error) {
      errors.push(parsed.error);
      continue;
    }

    if (parsed?.data) {
      try {
        await prisma.question.create({ data: parsed.data });
        created += 1;
      } catch (error) {
        errors.push(`Question ${i + 1}: ${(error as Error).message}`);
      }
    }
  }

  return { created, errors };
}
