import { AppError } from '../../../utils/appError.js';
import { findClientProfileById } from '../../client/clientPersistence.js';
import { findFreelancerProfileById } from '../../freelancer/freelancerPersistence.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../../notifications/notificationMessages.js';
import { assertContractParticipant } from '../contracts/contractsService.js';
import { findContractById } from '../contracts/contractsPersistence.js';
import { insertAttachment, listAttachmentsByContractId } from './attachmentsPersistence.js';

const MAX_NOTE_LENGTH = 1000;

const toPublicAttachment = (row) => ({
  id: row.id,
  contract_id: row.contract_id,
  uploaded_by: row.uploaded_by,
  uploaded_by_name: row.uploaded_by_name ?? null,
  file_name: row.file_name,
  file_url: row.file_url,
  mime_type: row.mime_type,
  size_bytes: row.size_bytes,
  note: row.note,
  created_at: row.created_at,
});

const requireParticipantContract = async (contractId, actor) => {
  const contract = await findContractById(contractId);

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  await assertContractParticipant(contract, actor);
  return contract;
};

export const listContractAttachments = async (contractId, actor) => {
  const contract = await requireParticipantContract(contractId, actor);
  const rows = await listAttachmentsByContractId(contract.id);
  return rows.map(toPublicAttachment);
};

export const addContractAttachment = async (contractId, actor, file, rawNote) => {
  const contract = await requireParticipantContract(contractId, actor);
  const note = typeof rawNote === 'string' ? rawNote.trim().slice(0, MAX_NOTE_LENGTH) : '';

  const created = await insertAttachment({
    contractId: contract.id,
    uploadedBy: actor.id,
    fileName: file.file_name,
    fileUrl: file.file_url,
    mimeType: file.mime_type,
    sizeBytes: file.size_bytes,
    note: note || null,
  });

  const counterpart =
    actor.role === 'freelancer'
      ? await findClientProfileById(contract.client_id)
      : await findFreelancerProfileById(contract.freelancer_id);

  if (counterpart?.user_id) {
    await notifyUser({
      userId: counterpart.user_id,
      type: NOTIFICATION_TYPES.DELIVERY_FILE_UPLOADED,
    });
  }

  return toPublicAttachment(created);
};
