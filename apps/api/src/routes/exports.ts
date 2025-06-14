import { Router } from 'express';
import { exportBookmarks, getExportFormats } from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All export routes require authentication
router.use(authenticate);

router.get('/formats', getExportFormats);
router.get('/bookmarks', exportBookmarks);

export { router as exportRoutes };