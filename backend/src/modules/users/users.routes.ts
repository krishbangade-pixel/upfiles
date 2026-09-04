import { Router } from 'express';
import { getUserProfile, updateUserProfile, updateProfileSchema } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/me', getUserProfile);
router.patch('/me', validate({ body: updateProfileSchema }), updateUserProfile);

export default router;
