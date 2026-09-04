import { Router } from 'express';
import { register, login, logout, getMe, registerSchema, loginSchema } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
