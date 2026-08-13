import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '@shared/errors/app-error';

/**
 * Generic body-validation middleware. Parses `req.body` against `schema`
 * and replaces it with the parsed (typed, coerced) value, or forwards a
 * ValidationError to the error handler.
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError('Request body validation failed', result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}
