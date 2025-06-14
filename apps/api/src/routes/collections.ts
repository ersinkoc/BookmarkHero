import { Router } from 'express';
import {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  getCollectionBookmarks
} from '../controllers/collectionController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createCollectionSchema,
  updateCollectionSchema,
  idParamSchema
} from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', getCollections);
router.post('/', validateRequest(createCollectionSchema), createCollection);
router.get('/:id', validateRequest(idParamSchema), getCollection);
router.get('/:id/bookmarks', validateRequest(idParamSchema), getCollectionBookmarks);
router.put('/:id', validateRequest(updateCollectionSchema), updateCollection);
router.delete('/:id', validateRequest(idParamSchema), deleteCollection);

export { router as collectionRoutes };