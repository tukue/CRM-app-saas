import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Rate limiter metrics
const rateLimitCounter = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['ip', 'endpoint']
});

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

class InMemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  increment(key: string): { count: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);
    
    if (!record || now > record.resetTime) {
      const newRecord = { count: 1, resetTime: now + 60000 }; // 1 minute window
      this.store.set(key, newRecord);
      return newRecord;
    }
    
    record.count++;
    this.store.set(key, record);
    return record;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const store = new InMemoryStore();

// Cleanup expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs = 60000, // 1 minute
    maxRequests = 100,
    message = "Too many requests, please try again later",
    skipSuccessfulRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.originalUrl}`;
    const record = store.increment(key);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    });

    if (record.count > maxRequests) {
      rateLimitCounter.inc({
        ip: req.ip,
        endpoint: req.originalUrl
      });
      
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000)
      });
    }

    // Reset counter on successful requests if option is enabled
    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          store.reset(key);
        }
      });
    }

    next();
  };
};

// Predefined rate limiters
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many authentication attempts, please try again later"
});