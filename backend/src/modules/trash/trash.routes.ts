import { Router } from 'express';
import { getTrash, restoreItem, deletePermanently, restoreSchema } from './trash.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', getTrash);
router.post('/restore', validate({ body: restoreSchema }), restoreItem);
router.delete('/:id/permanent', deletePermanently);

export default router;
