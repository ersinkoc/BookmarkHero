import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { emailService } from '../services/emailService';
import { AuthenticationError, ValidationError, NotFoundError } from '../utils/errors';

export async function requestEmailVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { emailVerification: true }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Delete existing verification if any
    if (user.emailVerification) {
      await prisma.emailVerification.delete({
        where: { userId: user.id }
      });
    }

    // Create new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name || '', token);

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    logger.error('Request email verification error:', error);
    throw error;
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.body;

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verification) {
      throw new ValidationError('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({
        where: { id: verification.id }
      });
      throw new ValidationError('Verification token expired');
    }

    // Update user and delete verification
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true }
      }),
      prisma.emailVerification.delete({
        where: { id: verification.id }
      })
    ]);

    // Send welcome email
    await emailService.sendWelcomeEmail(
      verification.user.email,
      verification.user.name || ''
    );

    logger.info(`Email verified for user: ${verification.user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Verify email error:', error);
    throw error;
  }
}

export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists, a password reset email will be sent'
      });
    }

    // Create reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.name || '', token);

    logger.info(`Password reset requested for: ${user.email}`);

    res.json({
      success: true,
      message: 'If an account exists, a password reset email will be sent'
    });
  } catch (error) {
    logger.error('Request password reset error:', error);
    throw error;
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!reset || reset.used) {
      throw new ValidationError('Invalid or used reset token');
    }

    if (reset.expiresAt < new Date()) {
      throw new ValidationError('Reset token expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true }
      })
    ]);

    // Invalidate all existing sessions
    await prisma.userSession.deleteMany({
      where: { userId: reset.userId }
    });

    logger.info(`Password reset completed for: ${reset.user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    throw error;
  }
}

export async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const { userId } = (req as any).user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { emailVerification: true }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Check if verification exists and is recent
    if (user.emailVerification) {
      const sentRecently = user.emailVerification.createdAt > 
        new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
      
      if (sentRecently) {
        throw new ValidationError('Verification email sent recently. Please wait before requesting again.');
      }

      // Delete old verification
      await prisma.emailVerification.delete({
        where: { userId: user.id }
      });
    }

    // Create new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name || '', token);

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    logger.error('Resend verification email error:', error);
    throw error;
  }
}