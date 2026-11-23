'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

interface AdminResult {
  id: string;
  studentName: string;
  email: string;
  score: number;
  aggregate: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  completedAt: string;
  type: string;
  examTitle: string;
  examId?: string;
  subject?: string;
  subjectScores: Record<string, { total: number; correct: number }>;
  subjectEntries: { subject: string; score: number; correct: number; total: number }[];
  user?: {
    fullName: string;
    email: string;
  };
  exam?: {
    title: string;
    subject: string;
    examType?: string;
  };
}

const MAX_SUBJECT_COLUMNS = 4;

function getSubjectAbbreviation(subject: string): string {
  const abbreviations: Record<string, string> = {
    'English Language': 'ENG',
    English: 'ENG',
    Mathematics: 'MATH',
    'General Mathematics': 'MATH',
    'Further Mathematics': 'FMATH',
    Physics: 'PHY',
    Chemistry: 'CHM',
    Biology: 'BIO',
    Government: 'GVT',
    Economics: 'ECO',
    'Literature in English': 'LIT',
    Literature: 'LIT',
    'Christian Religious Studies': 'CRS',
    'Islamic Religious Studies': 'IRS',
    Geography: 'GEO',
    Commerce: 'COM',
    Accounting: 'ACC',
    'Financial Accounting': 'ACC',
    'Civic Education': 'CIV',
    History: 'HIS',
    'Agricultural Science': 'AGR',
    Agriculture: 'AGR',
    French: 'FRE',
    Yoruba: 'YOR',
    Igbo: 'IGB',
    Hausa: 'HAU',
    'Computer Studies': 'CST',
    'Data Processing': 'DTP',
  };
  const normalized = subject.trim();
  return abbreviations[normalized] || normalized.toUpperCase().slice(0, 3);
}

interface PrintRow {
  key: string;
  studentName: string;
  subjects: { subject: string; score: number }[];
  total: number;
}

function getRowSubjects(student: AdminResult): { subject: string; score: number }[] {
  let entries: { subject: string; score: number }[] = [];

  if (student.subjectEntries && student.subjectEntries.length > 0) {
    entries = student.subjectEntries.map((entry) => ({
      subject: entry.subject,
      score: entry.score,
    }));
  } else if (student.subjectScores) {
    entries = Object.entries(student.subjectScores).map(([subject, data]) => ({
      subject,
      score: data.correct * 2,
    }));
  }

  if (entries.length === 0 && student.subject) {
    const subjects = student.subject.split(',').map((s) => s.trim()).filter(Boolean);
    entries = subjects.map((subject) => ({
      subject,
      score: student.score || 0,
    }));
  }

  const englishIndex = entries.findIndex((entry) => /english/i.test(entry.subject));
  if (englishIndex > 0) {
    const [english] = entries.splice(englishIndex, 1);
    entries.unshift(english);
  }

  return entries.slice(0, MAX_SUBJECT_COLUMNS);
}

function getRowTotal(student: AdminResult): number {
  return student.aggregate;
}

function buildRows(list: AdminResult[]): PrintRow[] {
  const groups = new Map<string, {
    studentName: string;
    best: Map<string, { subject: string; score: number }>;
    bestAggregate: number;
    representative: AdminResult | null;
  }>();

  list.forEach((result) => {
    const identity = (result.studentName || result.email || result.id).toLowerCase().replace(/\s+/g, ' ').trim();
    const key = identity;

    if (!groups.has(key)) {
      groups.set(key, { studentName: result.studentName, best: new Map(), bestAggregate: 0, representative: null });
    }
    const group = groups.get(key)!;

    if (result.aggregate > group.bestAggregate) {
      group.bestAggregate = result.aggregate;
      group.representative = result;
    }

    getRowSubjects(result).forEach((entry) => {
      const subjectKey = entry.subject.trim().toLowerCase();
      const existing = group.best.get(subjectKey);
      if (!existing || entry.score > existing.score) {
        group.best.set(subjectKey, entry);
      }
    });
  });

  return Array.from(groups.entries()).map(([key, group]) => {
    const all = Array.from(group.best.values());
    const english = all.filter((e) => /english/i.test(e.subject));
    const others = all.filter((e) => !/english/i.test(e.subject));

    const slots = MAX_SUBJECT_COLUMNS - Math.min(english.length, 1);
    let chosenOthers = others;
    if (others.length > slots) {
      const topScores = [...others].sort((a, b) => b.score - a.score).slice(0, slots);
      chosenOthers = others.filter((e) => topScores.includes(e));
    }

    const subjects = [...english.slice(0, 1), ...chosenOthers].slice(0, MAX_SUBJECT_COLUMNS);
    const total = group.representative ? getRowTotal(group.representative) : 0;
    return { key, studentName: group.studentName, subjects, total };
  });
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getHeaderLines(): { text: string; italic?: boolean; small?: boolean }[] {
  return [
    { text: 'CBT' },
    { text: 'PRACTICE EXAM', italic: true },
  ];
}

function AdminPrintPracticeInner() {
  const searchParams = useSearchParams();
  const sortBy = searchParams.get('sortBy') || 'score';
  const subject = searchParams.get('subject') || undefined;

  const [results, setResults] = useState<AdminResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [sortBy, subject]);

  async function fetchResults() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.adminGetFilteredResults({
        type: 'PRACTICE',
        sortBy: sortBy === 'date' ? 'date' : 'score',
        page: 1,
        limit: 1000,
      });
      const response = data as any;
      const mappedResults = (response.data?.results || []) as AdminResult[];
      setResults(mappedResults);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  const examDate = today.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const studentsPerPage = 20;
  const sortedStudents = buildRows(results).sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return a.studentName.localeCompare(b.studentName);
  });

  const pages: { students: PrintRow[]; pageNumber: number }[] = [];
  for (let i = 0; i < sortedStudents.length; i += studentsPerPage) {
    pages.push({
      students: sortedStudents.slice(i, i + studentsPerPage),
      pageNumber: Math.floor(i / studentsPerPage) + 1,
    });
  }

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body {
          width: 100%;
          min-height: 100%;
          font-family: Arial, Helvetica, sans-serif;
          background: #ffffff;
        }

        body {
          color: #97005f;
        }

        .print-sheet {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #fff5fa;
          border: 1.2mm solid #9d0061;
          overflow: hidden;
          position: relative;
          page-break-after: always;
          break-after: page;
        }

        .print-sheet:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        .header {
          height: 54.5mm;
          position: relative;
          border-bottom: 0.6mm solid #9d0061;
          background: linear-gradient(90deg, #ffd8e9 0%, #fff1f7 55%, #ffeaf3 100%);
          overflow: hidden;
        }

        .logo-area {
          position: absolute;
          left: 4mm;
          top: 4mm;
          width: 116mm;
          height: 40mm;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
        }

        .logo-area img {
          width: 113mm;
          height: auto;
          max-height: 43mm;
          object-fit: contain;
          object-position: left center;
          display: block;
        }

        .header-title {
          position: absolute;
          right: 7mm;
          top: 7mm;
          width: 77mm;
          color: #a00061;
          text-transform: uppercase;
          font-weight: 900;
          line-height: 0.94;
          letter-spacing: -0.35mm;
        }

        .header-title .line {
          display: block;
          font-size: 8.1mm;
        }

        .header-title .line-small {
          display: block;
          font-size: 7.6mm;
        }

        .header-title .italic {
          font-style: italic;
        }

        .date-pill {
          position: absolute;
          right: 7mm;
          bottom: 5.5mm;
          height: 9.3mm;
          min-width: 66mm;
          padding: 1.2mm 4.2mm 1mm;
          background: #f50a70;
          border-radius: 7mm;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          font-size: 5.8mm;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
        }

        .page-title-row {
          height: 7.6mm;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff0f7;
        }

        .page-title-row::before,
        .page-title-row::after {
          content: '';
          height: 0.35mm;
          width: 24mm;
          background: #9d0061;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .page-title-row::before {
          left: 79mm;
        }

        .page-title-row::after {
          right: 79mm;
        }

        .page-number {
          position: relative;
          z-index: 2;
          background: #fff0f7;
          padding: 0 2.5mm;
          font-size: 4.8mm;
          line-height: 1;
          font-weight: 900;
          color: #9d0061;
          text-transform: uppercase;
        }

        .result-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          color: #97005f;
          background: #ffeef6;
        }

        .result-table th,
        .result-table td {
          border-right: 0.55mm solid #a50065;
          border-bottom: 0.55mm solid #a50065;
          vertical-align: middle;
        }

        .result-table th:last-child,
        .result-table td:last-child {
          border-right: none;
        }

        .result-table thead th {
          height: 9.6mm;
          font-size: 4.35mm;
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          background: #ffe4f0;
          color: #97005f;
          text-align: left;
          padding: 1.3mm 1.8mm;
        }

        .result-table thead th.sn {
          width: 12.2mm;
          text-align: center;
        }

        .result-table thead th.student {
          width: 72mm;
        }

        .result-table thead th.subject {
          width: 25mm;
          text-align: center;
        }

        .result-table thead th.aggregate {
          width: 26mm;
          text-align: center;
          white-space: nowrap;
          padding: 1.3mm 0.5mm;
        }

        .result-table tbody tr {
          height: 11.05mm;
        }

        .result-table tbody td {
          font-size: 4.15mm;
          line-height: 1;
          font-weight: 800;
          padding: 1.2mm 2mm;
          background: #fff0f7;
        }

        .result-table tbody td.sn {
          text-align: center;
          font-size: 4.45mm;
          font-weight: 900;
          white-space: nowrap;
        }

        .result-table tbody td.student-name.long-name {
          font-size: 3.2mm;
        }

        .result-table tbody td.student-name {
          text-align: left;
          font-size: 4.1mm;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: clip;
        }

        .result-table tbody td.subject-score {
          text-align: left;
          white-space: nowrap;
          font-weight: 900;
          overflow: hidden;
          text-overflow: clip;
        }

        .result-table tbody td.aggregate {
          text-align: center;
          font-size: 4.5mm;
          font-weight: 900;
        }

        @media print {
          .screen-controls {
            display: none !important;
          }

          .print-sheet {
            margin: 0;
            width: 210mm;
            min-height: 297mm;
            border: 1.2mm solid #9d0061;
          }

          .result-table {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .header,
          .page-title-row,
          .result-table th,
          .result-table td,
          .date-pill {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .result-table tbody tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

        @media screen and (max-width: 900px) {
          body {
            background: #eeeeee;
          }

          .print-sheet {
            transform-origin: top center;
            margin-bottom: 20px;
          }
        }
      `}</style>

      <div id="printContainer">
        {pages.length === 0 ? (
          <section className="print-sheet">
            <header className="header">
              <div className="logo-area">
                <img src="/logo.png" alt="Edwardian Consult Logo" className="opacity-50" />
              </div>
              <div className="header-title">
                {getHeaderLines().map((headerLine, idx) => (
                  <span
                    key={idx}
                    className={`${headerLine.small ? 'line-small' : 'line'}${headerLine.italic ? ' italic' : ''}`}
                  >
                    {escapeHtml(headerLine.text)}
                  </span>
                ))}
              </div>
              <div className="date-pill">{escapeHtml(examDate)}</div>
            </header>
            <div className="page-title-row">
              <div className="page-number">PAGE 1</div>
            </div>
            <table className="result-table">
              <thead>
                <tr>
                  <th className="sn">S/N</th>
                  <th className="student">STUDENT NAME</th>
                  {Array.from({ length: MAX_SUBJECT_COLUMNS }).map((_, idx) => (
                    <th key={idx} className="subject"></th>
                  ))}
                  <th className="aggregate">AGG/400</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    {error ? `Error loading results: ${escapeHtml(error)}` : 'No results found for the selected filters.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        ) : (
          pages.map((page) => (
            <section key={page.pageNumber} className="print-sheet">
              <header className="header">
                <div className="logo-area">
                  <img src="/logo.png" alt="Edwardian Consult Logo" />
                </div>
                <div className="header-title">
                  {getHeaderLines().map((headerLine, idx) => (
                    <span
                      key={idx}
                      className={`${headerLine.small ? 'line-small' : 'line'}${headerLine.italic ? ' italic' : ''}`}
                    >
                      {escapeHtml(headerLine.text)}
                    </span>
                  ))}
                </div>
                <div className="date-pill">{escapeHtml(examDate)}</div>
              </header>

              <div className="page-title-row">
                <div className="page-number">PAGE {page.pageNumber}</div>
              </div>

              <table className="result-table">
                <thead>
                  <tr>
                    <th className="sn">S/N</th>
                    <th className="student">STUDENT NAME</th>
                    {Array.from({ length: MAX_SUBJECT_COLUMNS }).map((_, idx) => (
                      <th key={idx} className="subject"></th>
                    ))}
                    <th className="aggregate">AGG/400</th>
                  </tr>
                </thead>
                <tbody>
                  {page.students.map((student, index) => (
                    <tr key={student.key}>
                      <td className="sn">
                        {((page.pageNumber - 1) * studentsPerPage) + index + 1}.
                      </td>
                      <td className={`student-name${(student.studentName || '').length > 24 ? ' long-name' : ''}`}>
                        {escapeHtml(student.studentName || 'Unknown')}
                      </td>
                      {Array.from({ length: MAX_SUBJECT_COLUMNS }).map((_, idx) => {
                        const entry = student.subjects[idx];
                        return (
                          <td key={idx} className="subject-score">
                            {entry ? `${escapeHtml(getSubjectAbbreviation(entry.subject))} ${escapeHtml(String(entry.score))}` : ''}
                          </td>
                        );
                      })}
                      <td className="aggregate">{student.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))
        )}
      </div>
    </>
  );
}

export default function AdminPrintPracticePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
      <AdminPrintPracticeInner />
    </Suspense>
  );
}
