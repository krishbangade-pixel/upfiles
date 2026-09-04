import { Router } from 'express';
import { searchResources } from './search.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticate, searchResources);

export default router;
