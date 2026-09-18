'use client';

import { useEffect, useState } from 'react';
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

export default function AdminPrintResultsPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'ALL';
  const examId = searchParams.get('examId') || undefined;
  const sortBy = searchParams.get('sortBy') || 'score';

  const [results, setResults] = useState<AdminResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterInfo, setFilterInfo] = useState<{ type: string; examTitle?: string }>({ type: 'ALL' });

  useEffect(() => {
    fetchResults();
  }, [type, examId, sortBy]);

  async function fetchResults() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.adminGetFilteredResults({
        type: type === 'ALL' ? undefined : type,
        examId,
        sortBy: sortBy === 'date' ? 'date' : 'score',
        page: 1,
        limit: 1000,
      });
      const response = data as any;
      const mappedResults = (response.data?.results || []) as AdminResult[];
      setResults(mappedResults);
      setFilterInfo({
        type: type || 'ALL',
        examTitle: response.data?.filter?.examTitle,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }

  function getExamTitle(): string {
    if (filterInfo.type === 'MOCK' && filterInfo.examTitle) {
      return `RESULT – ${filterInfo.examTitle}`;
    }
    if (filterInfo.type === 'PRACTICE') {
      return 'CBT RESULTS';
    }
    return 'ALL RESULTS';
  }

  function getSubjects(): string[] {
    if (filterInfo.type === 'MOCK' && results.length > 0) {
      const subjects = new Set<string>();
      results.forEach(result => {
        Object.keys(result.subjectScores || {}).forEach(subject => subjects.add(subject));
      });
      return Array.from(subjects);
    }
    return [];
  }

  function getStudentScore(student: AdminResult, subject: string): number {
    const subjectScore = student.subjectScores?.[subject];
    if (subjectScore && subjectScore.total > 0) {
      return Math.round((subjectScore.correct / subjectScore.total) * 100);
    }
    return 0;
  }

  function escapeHtml(value: string): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const subjects = getSubjects();
  const examTitle = getExamTitle();
  const studentsPerPage = 20;

  const sortedStudents = [...results].sort((a, b) => {
    if (b.aggregate !== a.aggregate) {
      return b.aggregate - a.aggregate;
    }
    return a.studentName.localeCompare(b.studentName);
  });

  const pages: { students: AdminResult[]; pageNumber: number }[] = [];
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
          width: 79.5mm;
        }

        .result-table thead th.subject {
          width: 25mm;
          text-align: center;
        }

        .result-table thead th.aggregate {
          width: 18.5mm;
          text-align: center;
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
        {pages.map((page) => (
          <section key={page.pageNumber} className="print-sheet">
            <header className="header">
              <div className="logo-area">
                <img src="/logo.png" alt="Edwardian Consult Logo" />
              </div>
              <div className="header-title">
                <span className="line">BACK TO BACK</span>
                <span className="line">UTME</span>
                <span className="line italic">MOCK EXAM</span>
                <span className="line-small">{escapeHtml(examTitle)}</span>
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
                  {subjects.map((subject) => (
                    <th key={subject} className="subject">
                      {escapeHtml(subject)}
                    </th>
                  ))}
                  <th className="aggregate">AGG/100</th>
                </tr>
              </thead>
              <tbody>
                {page.students.map((student, index) => (
                  <tr key={student.id}>
                    <td className="sn">
                      {((page.pageNumber - 1) * studentsPerPage) + index + 1}.
                    </td>
                    <td className="student-name">{escapeHtml(student.studentName)}</td>
                    {subjects.map((subject) => (
                      <td key={subject} className="subject-score">
                        {escapeHtml(subject)} {escapeHtml(String(getStudentScore(student, subject)))}
                      </td>
                    ))}
                    <td className="aggregate">{escapeHtml(String(student.aggregate))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </>
  );
}
