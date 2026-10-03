import { query } from '../../../config/db.js';

const ATTACHMENT_COLUMNS = `
  a.id,
  a.contract_id,
  a.uploaded_by,
  a.file_name,
  a.file_url,
  a.mime_type,
  a.size_bytes,
  a.note,
  a.created_at
`;

export const listAttachmentsByContractId = async (contractId) => {
  const result = await query(
    `SELECT ${ATTACHMENT_COLUMNS},
       u.name AS uploaded_by_name
     FROM contract_attachments a
     LEFT JOIN users u ON u.id = a.uploaded_by
     WHERE a.contract_id = $1
     ORDER BY a.created_at DESC, a.id DESC`,
    [contractId],
  );

  return result.rows;
};

export const insertAttachment = async ({
  contractId,
  uploadedBy,
  fileName,
  fileUrl,
  mimeType,
  sizeBytes,
  note,
}) => {
  const result = await query(
    `INSERT INTO contract_attachments (
       contract_id,
       uploaded_by,
       file_name,
       file_url,
       mime_type,
       size_bytes,
       note
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, contract_id, uploaded_by, file_name, file_url, mime_type,
       size_bytes, note, created_at`,
    [contractId, uploadedBy, fileName, fileUrl, mimeType, sizeBytes, note],
  );

  return result.rows[0];
};
