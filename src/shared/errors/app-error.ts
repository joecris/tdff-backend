/**
 * Base class for all domain/application errors. Framework-agnostic on
 * purpose — it carries no HTTP concept. The inbound HTTP adapter's error
 * handler middleware maps `httpStatus` to an actual response; other
 * inbound adapters (a CLI, a queue consumer) can map it differently.
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = 400;

  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  readonly httpStatus = 409;
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  readonly httpStatus = 401;
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';
  readonly httpStatus = 403;
}
