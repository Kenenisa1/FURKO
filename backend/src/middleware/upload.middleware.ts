import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

// Ensure upload directory exists
if (!fs.existsSync(env.uploads.directory)) {
  fs.mkdirSync(env.uploads.directory, { recursive: true });
}

// Storage configuration with unique naming
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, env.uploads.directory);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${uuidv4().slice(0, 8)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

// File filter for validating image/evidence types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const isAllowedMime = env.uploads.allowedMimeTypes.includes(file.mimetype.toLowerCase());
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = allowedExtensions.includes(ext);

  if (isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type: ${file.mimetype}. Allowed formats: JPG, PNG, WEBP, HEIC.`
    ) as Error & { statusCode?: number };
    error.statusCode = 400;
    cb(error);
  }
};

export const uploadEvidence = multer({
  storage,
  limits: {
    fileSize: env.uploads.maxFileSizeBytes,
    files: 1,
  },
  fileFilter,
});
