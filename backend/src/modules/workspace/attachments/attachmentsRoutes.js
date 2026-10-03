import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorizeRoles } from '../../../middleware/roleGuard.js';
import { requireEntityId } from '../../../utils/entityId.js';
import { requireUploadedFile, toPublicFile, upload } from '../../uploads/uploadStorage.js';
import { addContractAttachment, listContractAttachments } from './attachmentsService.js';

const requireContractParticipant = authorizeRoles('client', 'freelancer');

const readContractId = (req) =>
  requireEntityId(
    req.params.id,
    'id',
    'Contract id is required',
    'Contract id must be a valid integer',
  );

export const contractAttachmentsRouter = Router({ mergeParams: true });

contractAttachmentsRouter.get(
  '/',
  authenticate,
  requireContractParticipant,
  asyncHandler(async (req, res) => {
    const data = await listContractAttachments(readContractId(req), req.user);

    res.status(200).json({
      success: true,
      data,
    });
  }),
);

contractAttachmentsRouter.post(
  '/',
  authenticate,
  requireContractParticipant,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const file = requireUploadedFile(req);
    const data = await addContractAttachment(
      readContractId(req),
      req.user,
      toPublicFile(req, file),
      req.body?.note,
    );

    res.status(201).json({
      success: true,
      data,
    });
  }),
);
