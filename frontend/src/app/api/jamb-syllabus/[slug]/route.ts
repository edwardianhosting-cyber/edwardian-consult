import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (req.headers.get('sec-fetch-dest') === 'document') {
    return new NextResponse('Not found', { status: 404 });
  }
  const slug = decodeURIComponent(params.slug).toLowerCase().replace(/\s+/g, '-');
  const dir = path.join(process.cwd(), 'public', 'jamb-syllabus');
  let files: string[] = [];
  try { files = await readdir(dir); } catch { return new NextResponse('Not found', { status: 404 }); }
  const match = files.find((f) => f.toLowerCase().replace(/\s+/g, '-').replace(/\.pdf$/, '') === slug);
  if (!match) return new NextResponse('Not found', { status: 404 });
  try {
    const buf = await readFile(path.join(dir, match));
    return new NextResponse(buf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline', 'Cache-Control': 'private, no-store' } });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}