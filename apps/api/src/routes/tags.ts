import { Router } from 'express';
import {
  createTag,
  getTags,
  updateTag,
  deleteTag
} from '../controllers/tagController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createTagSchema,
  updateTagSchema,
  idParamSchema
} from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', getTags);
router.post('/', validateRequest(createTagSchema), createTag);
router.put('/:id', validateRequest(updateTagSchema), updateTag);
router.delete('/:id', validateRequest(idParamSchema), deleteTag);

export { router as tagRoutes };