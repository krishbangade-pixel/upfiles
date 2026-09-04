import { Router } from 'express';
import { createShare, getShares, removeShare, getSharesForUser, createShareSchema } from './shares.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createShareSchema }), createShare);
router.get('/me', getSharesForUser);
router.get('/:resourceType/:resourceId', getShares);
router.delete('/:id', removeShare);

export default router;
