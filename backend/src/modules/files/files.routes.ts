import { Router } from 'express';
import {
  initUpload,
  completeUpload,
  getFile,
  downloadFile,
  updateFile,
  deleteFile,
  listAllFiles,
  initUploadSchema,
  completeUploadSchema,
  updateFileSchema,
} from './files.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/init', validate({ body: initUploadSchema }), initUpload);
router.post('/complete', validate({ body: completeUploadSchema }), completeUpload);
router.get('/', listAllFiles);
router.get('/:id', getFile);
router.get('/:id/download', downloadFile);
router.patch('/:id', validate({ body: updateFileSchema }), updateFile);
router.delete('/:id', deleteFile);

export default router;
