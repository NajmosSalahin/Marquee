import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import auth from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, message: { message: 'Too many attempts — try again in a bit' } });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, standardHeaders: true, message: { message: 'Too many accounts from this address — try again later' } });
const mailLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, message: { message: 'Too many emails from this address — try again later' } });

router.post(
  '/register',
  registerLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 24 }).withMessage('Username must be 3–24 characters'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  loginLimiter,
  [body('identifier').trim().notEmpty().withMessage('Enter your email or username'), body('password').notEmpty().withMessage('Enter your password')],
  validate,
  login
);

router.post(
  '/forgot-password',
  mailLimiter,
  [body('email').isEmail().withMessage('Enter a valid email')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  mailLimiter,
  [
    body('token').notEmpty().withMessage('Missing reset token'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
);

router.post(
  '/verify-email',
  mailLimiter,
  [body('token').notEmpty().withMessage('Missing verification token')],
  validate,
  verifyEmail
);

router.post('/resend-verification', auth, mailLimiter, resendVerification);

router.post('/logout', auth, logout);
router.get('/me', auth, me);

export default router;
