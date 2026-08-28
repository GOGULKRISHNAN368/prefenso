import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const isDuplicate = error?.code === 11000;
  const isValidation = error instanceof mongoose.Error.ValidationError;
  const appError = error instanceof AppError ? error : new AppError(isDuplicate ? 'A record with that value already exists' : isValidation ? 'Invalid data provided' : 'Something went wrong', isDuplicate ? 409 : isValidation ? 422 : 500);
  if (appError.statusCode >= 500) console.error(error);
  res.status(appError.statusCode).json({ success: false, message: appError.message, errors: appError.errors });
};
