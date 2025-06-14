import { Router } from 'express';
import { body } from 'express-validator';
import {
  updateProfile,
  updatePreferences,
  deleteAccount
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.put('/profile', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('avatar').optional().isURL(),
  validate
], updateProfile);

router.put('/preferences', [
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('defaultView').optional().isIn(['grid', 'list']),
  body('itemsPerPage').optional().isInt({ min: 10, max: 100 }),
  body('autoSaveBookmarks').optional().isBoolean(),
  body('enableNotifications').optional().isBoolean(),
  validate
], updatePreferences);

router.delete('/account', deleteAccount);

export { router as userRoutes };