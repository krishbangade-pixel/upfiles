import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/users.routes.js';
import folderRoutes from '../modules/folders/folders.routes.js';
import fileRoutes from '../modules/files/files.routes.js';
import shareRoutes from '../modules/shares/shares.routes.js';
import linkRoutes from '../modules/links/links.routes.js';
import searchRoutes from '../modules/search/search.routes.js';
import starRoutes from '../modules/stars/stars.routes.js';
import trashRoutes from '../modules/trash/trash.routes.js';
import activityRoutes from '../modules/activities/activities.routes.js';
import storageRoutes from '../modules/storage/storage.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/folders', folderRoutes);
router.use('/files', fileRoutes);
router.use('/shares', shareRoutes);
router.use('/link-shares', linkRoutes);
router.use('/link', linkRoutes);
router.use('/search', searchRoutes);
router.use('/stars', starRoutes);
router.use('/trash', trashRoutes);
router.use('/activities', activityRoutes);
router.use('/storage', storageRoutes);

export default router;
