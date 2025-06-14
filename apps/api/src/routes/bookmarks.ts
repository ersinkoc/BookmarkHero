import { Router } from 'express';
import {
  createBookmark,
  getBookmarks,
  getBookmark,
  updateBookmark,
  deleteBookmark,
  searchBookmarks,
  bulkImport,
  extractMetadata
} from '../controllers/bookmarkController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createBookmarkSchema,
  getBookmarksSchema,
  updateBookmarkSchema,
  searchBookmarksSchema,
  bulkImportSchema,
  idParamSchema,
  extractMetadataSchema
} from '../validators';
import { bulkRateLimiter, apiRateLimiter } from '../middleware/rateLimiters';

const router = Router();

// All bookmark routes require authentication
router.use(authenticate);
router.use(apiRateLimiter);

router.get('/', validateRequest(getBookmarksSchema), getBookmarks);
router.post('/', validateRequest(createBookmarkSchema), createBookmark);
router.get('/search', validateRequest(searchBookmarksSchema), searchBookmarks);
router.post('/bulk-import', bulkRateLimiter, validateRequest(bulkImportSchema), bulkImport);
router.post('/extract-metadata', validateRequest(extractMetadataSchema), extractMetadata);
router.get('/:id', validateRequest(idParamSchema), getBookmark);
router.put('/:id', validateRequest(updateBookmarkSchema), updateBookmark);
router.delete('/:id', validateRequest(idParamSchema), deleteBookmark);

export { router as bookmarkRoutes };