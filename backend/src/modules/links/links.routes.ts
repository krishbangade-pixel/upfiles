import { Router } from 'express';
import { createLinkShare, getLinkShare, getLinkFile, deleteLinkShare, createLinkShareSchema } from './links.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { publicLinkLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/', authenticate, validate({ body: createLinkShareSchema }), createLinkShare);
router.get('/:token', publicLinkLimiter, getLinkShare);
router.get('/:token/file/:fileId', publicLinkLimiter, getLinkFile);
router.delete('/:id', authenticate, deleteLinkShare);

export default router;
