import { Router } from 'express';
import { getStorageUsage } from './storage.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/usage', authenticate, getStorageUsage);

export default router;
