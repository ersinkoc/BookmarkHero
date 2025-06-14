import rateLimit from 'express-rate-limit';
import { securityConfig } from '../config/security';

// Authentication rate limiter - stricter for login/register
export const authRateLimiter = rateLimit({
  ...securityConfig.rateLimit.auth,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: securityConfig.rateLimit.auth.message
    });
  }
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  ...securityConfig.rateLimit.api,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: securityConfig.rateLimit.api.message
    });
  }
});

// Bulk operations rate limiter
export const bulkRateLimiter = rateLimit({
  ...securityConfig.rateLimit.bulk,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.includes('bulk'),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: securityConfig.rateLimit.bulk.message
    });
  }
});