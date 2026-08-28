import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { Block } from '../modules/blocks/block.model';

export const requireRole = (...roles: Array<'ADMIN' | 'WATCHMAN'>) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError('You do not have permission to perform this action', 403));
  next();
};

export const requireActiveBlock = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user?.blockId) return next(new AppError('Watchman is not assigned to a block', 403));
    const block = await Block.findOne({ _id: req.user.blockId, isActive: true });
    if (!block) return next(new AppError('This block is inactive', 403));
    next();
  } catch (error) { next(error); }
};
