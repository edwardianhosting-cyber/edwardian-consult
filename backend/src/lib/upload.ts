import multer from 'multer';

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.csv', '.xls', '.xlsx'];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function isValidImageFile(file: Express.Multer.File): boolean {
  const ext = '.' + (file.originalname.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return false;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return false;
  }

  return true;
}

export function isValidDocumentFile(file: Express.Multer.File): boolean {
  const ext = '.' + (file.originalname.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
    return false;
  }

  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
    return false;
  }

  return true;
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!isValidImageFile(file)) {
      return cb(new Error('Invalid file type. Allowed: jpg, jpeg, png, webp, gif'));
    }
    cb(null, true);
  },
});

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!isValidDocumentFile(file)) {
      return cb(new Error('Invalid file type. Allowed: csv, xls, xlsx'));
    }
    cb(null, true);
  },
});
