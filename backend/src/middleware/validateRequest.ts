import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/appError';

export const validateRequest = (schema: z.ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) return next(new AppError('Please check the highlighted fields', 422, result.error.issues));
  req.body = result.data.body;
  req.params = result.data.params;
  next();
};
