import { Router } from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/authController';
import { 
  requestEmailVerification, 
  verifyEmail, 
  requestPasswordReset, 
  resetPassword,
  resendVerificationEmail
} from '../controllers/authExtendedController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  requestEmailVerificationSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
} from '../validators';
import { authRateLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', validateRequest(refreshTokenSchema), refreshToken);
router.get('/me', authenticate, getMe);

// Email verification
router.post('/verify-email/request', authRateLimiter, validateRequest(requestEmailVerificationSchema), requestEmailVerification);
router.post('/verify-email', authRateLimiter, validateRequest(verifyEmailSchema), verifyEmail);
router.post('/verify-email/resend', authenticate, resendVerificationEmail);

// Password reset
router.post('/password-reset/request', authRateLimiter, validateRequest(requestPasswordResetSchema), requestPasswordReset);
router.post('/password-reset', authRateLimiter, validateRequest(resetPasswordSchema), resetPassword);

export { router as authRoutes };