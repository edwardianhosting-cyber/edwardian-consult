import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { SUBJECT_PDFS } from '@/lib/subjectPdfs'; // move your map here

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } } // Next 15: { params: Promise<{slug:string}> } and await it
) {
  // Block someone pasting the URL into the address bar
  if (req.headers.get('sec-fetch-dest') === 'document') {
    return new NextResponse('Not found', { status: 404 });
  }

  const slug = decodeURIComponent(params.slug);
  const file = SUBJECT_PDFS[slug];
  if (!file) return new NextResponse('Not found', { status: 404 });

  const buf = await readFile(path.join(process.cwd(), 'public', 'syllabus', file));
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
    },
  });
}