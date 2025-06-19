import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Create error metrics
const errorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['status_code', 'method', 'route']
});

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Track error metrics
  errorCounter.inc({
    status_code: statusCode.toString(),
    method: req.method,
    route: req.route?.path || req.path
  });

  // Log error details
  console.error(`Error ${statusCode}: ${message}`);
  if (statusCode === 500) {
    console.error(error.stack);
  }

  // Don't leak sensitive information in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response: any = {
    error: message,
    status: statusCode
  };

  if (isDevelopment) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};