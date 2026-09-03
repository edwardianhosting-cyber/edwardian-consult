import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const BASE_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']);
const ALLOWED_AUDIO_TYPES = new Set(['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-m4a']);

export function getFileCategory(mimeType: string): 'image' | 'video' | 'audio' | 'other' {
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) return 'video';
  if (ALLOWED_AUDIO_TYPES.has(mimeType)) return 'audio';
  return 'other';
}

export function saveBufferToDisk(buffer: Buffer, mimeType: string, category: 'image' | 'video' | 'audio'): string {
  const ext = getExtension(mimeType);
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_DIR, 'study-materials', category);
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);
  return `${BASE_URL}/uploads/study-materials/${category}/${filename}`;
}

export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogg',
    'video/quicktime': '.mov',
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/x-m4a': '.m4a',
  };
  return map[mimeType] || '';
}
