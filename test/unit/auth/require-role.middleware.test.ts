import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { requireRole } from '@infrastructure/http/middlewares/require-role.middleware';
import { ForbiddenError, UnauthorizedError } from '@shared/errors/app-error';

describe('requireRole', () => {
  const res = {} as Response;

  it('calls next() with no error when req.auth matches the required role', () => {
    const middleware = requireRole('admin');
    const req = { auth: { userId: 'u1', role: 'admin' } } as Request;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(ForbiddenError) when req.auth has a different role', () => {
    const middleware = requireRole('admin');
    const req = { auth: { userId: 'u1', role: 'user' } } as Request;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('calls next(UnauthorizedError) when req.auth is missing entirely', () => {
    const middleware = requireRole('admin');
    const req = {} as Request;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
