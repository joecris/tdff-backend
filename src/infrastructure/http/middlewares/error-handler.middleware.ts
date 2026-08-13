import { ErrorRequestHandler } from 'express';
import { AppError } from '@shared/errors/app-error';

/**
 * Single place that maps domain/application errors to HTTP responses.
 * Must be registered last, after all routes.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.httpStatus).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof Error && 'details' in err
          ? { details: (err as { details?: unknown }).details }
          : {}),
      },
    });
    return;
  }

  req.log?.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
};
