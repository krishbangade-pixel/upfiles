import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else if (err.message) {
    statusCode = err.status || err.statusCode || 500;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.error('[Error Handler]', err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
