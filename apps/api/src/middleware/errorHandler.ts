import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    code: 'NOT_FOUND',
    path: req.path
  });
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let isOperational = false;

  // Handle known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || code;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // Mongoose/Validation errors
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
    isOperational = true;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
    isOperational = true;
  } else if (err.message?.includes('Unique constraint')) {
    statusCode = 409;
    message = 'Resource already exists';
    code = 'CONFLICT_ERROR';
    isOperational = true;
  } else if (err.message?.includes('Record to update not found')) {
    statusCode = 404;
    message = 'Resource not found';
    code = 'NOT_FOUND';
    isOperational = true;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
    isOperational = true;
  }

  // Log error
  const errorInfo = {
    message: err.message,
    code,
    statusCode,
    isOperational,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id
  };

  if (!isOperational) {
    logger.error('Unexpected error:', errorInfo);
  } else {
    logger.warn('Operational error:', errorInfo);
  }

  // Send error response
  const response: any = {
    success: false,
    error: message,
    code
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && !isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}