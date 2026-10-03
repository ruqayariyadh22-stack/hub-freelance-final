import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireUploadedFile, toPublicFile, upload } from './uploadStorage.js';

const router = Router();

router.post(
  '/',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const file = requireUploadedFile(req);

    res.status(201).json({
      success: true,
      data: toPublicFile(req, file),
    });
  }),
);

export default router;
