import { Router } from 'express';
import { starResource, unstarResource, getStarred, starSchema } from './stars.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: starSchema }), starResource);
router.delete('/', validate({ body: starSchema }), unstarResource);
router.get('/', getStarred);

export default router;
