import { Router } from 'express';
import {
  createFolder,
  getFolder,
  getFolderChildren,
  updateFolder,
  deleteFolder,
  listAllFolders,
  createFolderSchema,
  updateFolderSchema,
} from './folders.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createFolderSchema }), createFolder);
router.get('/', listAllFolders);
router.get('/:id', getFolder);
router.get('/:id/children', getFolderChildren);
router.patch('/:id', validate({ body: updateFolderSchema }), updateFolder);
router.delete('/:id', deleteFolder);

export default router;
