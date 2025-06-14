import { Router } from 'express';
import {
  createShare,
  getShares,
  getPublicCollection,
  deleteShare
} from '../controllers/shareController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  shareCollectionSchema,
  idParamSchema,
  shareTokenParamSchema
} from '../validators';

const router = Router();

router.get('/public/:shareToken', validateRequest(shareTokenParamSchema), getPublicCollection);

router.use(authenticate);

router.get('/', getShares);
router.post('/', validateRequest(shareCollectionSchema), createShare);
router.delete('/:id', validateRequest(idParamSchema), deleteShare);

export { router as shareRoutes };