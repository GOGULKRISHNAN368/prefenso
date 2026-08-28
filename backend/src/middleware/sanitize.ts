import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';

function clean(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith('$') && !key.includes('.')).map(([key, item]) => [key, clean(item)]));
  return value;
}
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => { req.body = clean(req.body); req.query = clean(req.query) as typeof req.query; next(); };
