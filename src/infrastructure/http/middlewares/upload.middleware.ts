import { RequestHandler } from 'express';
import multer from 'multer';
import { ValidationError } from '@shared/errors/app-error';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB — plenty for a teams/riders roster sheet

// Matched by filename extension, not `file.mimetype` — browsers/clients
// are inconsistent about the MIME type they actually send for .xlsx
// (some send the correct OOXML type, many send `application/octet-stream`).
// The extension is the reliable signal; the sheet-shape validation that
// matters (right columns, right data) happens later in parseWorksheetRows.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      cb(new ValidationError(`Only .xlsx files are supported, got "${file.originalname}"`));
      return;
    }
    cb(null, true);
  },
});

/**
 * Wraps multer's single-file upload so its own errors (wrong extension,
 * file too large) speak the same `AppError` language as the rest of the
 * app — multer surfaces those as a plain `Error`/`MulterError`, which the
 * global error handler would otherwise flatten to an opaque 500 instead
 * of a 400.
 */
export function uploadExcelFile(fieldName: string): RequestHandler {
  const middleware = upload.single(fieldName);
  return (req, res, next) => {
    middleware(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        next(new ValidationError(`File upload failed: ${err.message}`));
        return;
      }
      next(err);
    });
  };
}
