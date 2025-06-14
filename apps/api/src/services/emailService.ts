import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Email service not configured - missing SMTP credentials');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        logger.error('Email service initialization failed:', error);
      } else {
        logger.info('Email service ready');
      }
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    if (!this.transporter) {
      logger.warn('Cannot send email - email service not configured');
      return;
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"BookmarkHero" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to BookmarkHero!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name || 'there'},</h2>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 BookmarkHero. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    if (!this.transporter) {
      logger.warn('Cannot send email - email service not configured');
      return;
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"BookmarkHero" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name || 'there'},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 BookmarkHero. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    if (!this.transporter) {
      logger.warn('Cannot send email - email service not configured');
      return;
    }

    const mailOptions = {
      from: `"BookmarkHero" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to BookmarkHero!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .feature { margin: 15px 0; padding-left: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome aboard, ${name}!</h1>
            </div>
            <div class="content">
              <h2>Your account is verified and ready to use!</h2>
              <p>Here's what you can do with BookmarkHero:</p>
              <div class="feature">
                📌 <strong>Save bookmarks</strong> - Save any link with automatic metadata extraction
              </div>
              <div class="feature">
                📁 <strong>Organize collections</strong> - Group your bookmarks into collections
              </div>
              <div class="feature">
                🏷️ <strong>Add tags</strong> - Tag your bookmarks for easy searching
              </div>
              <div class="feature">
                🔍 <strong>Search everything</strong> - Find any bookmark instantly
              </div>
              <div class="feature">
                🔗 <strong>Share collections</strong> - Share your collections with others
              </div>
              <p style="margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #3B82F6;">Go to your dashboard →</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2024 BookmarkHero. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw - welcome email is not critical
    }
  }
}

export const emailService = new EmailService();