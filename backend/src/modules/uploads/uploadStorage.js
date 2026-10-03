import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.resolve(currentDir, '../../../uploads');
export const UPLOADS_ROUTE = '/uploads';
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase().slice(0, 10);
    const safeExtension = /^\.[a-z0-9]+$/.test(extension) ? extension : '';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExtension}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError('Validation failed', 400, [
        { field: 'file', message: 'File type is not allowed' },
      ]));
      return;
    }

    cb(null, true);
  },
});

const publicBaseUrl = (req) => {
  if (env.publicApiUrl) {
    return env.publicApiUrl.replace(/\/+$/, '');
  }

  return `${req.protocol}://${req.get('host')}`;
};

export const requireUploadedFile = (req) => {
  if (!req.file) {
    throw new AppError('Validation failed', 400, [
      { field: 'file', message: 'A file is required' },
    ]);
  }

  return req.file;
};

export const toPublicFile = (req, file) => ({
  file_name: file.originalname,
  file_url: `${publicBaseUrl(req)}${UPLOADS_ROUTE}/${file.filename}`,
  mime_type: file.mimetype,
  size_bytes: file.size,
});
