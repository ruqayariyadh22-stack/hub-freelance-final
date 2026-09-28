import { query } from '../../../config/db.js';

const SPECIALTY_COLUMNS = `
  id,
  name,
  status,
  requested_by,
  reviewed_by,
  reviewed_at,
  created_at
`;

export const insertSpecialty = async ({ name, requestedBy }) => {
  const result = await query(
    `INSERT INTO specialties (
       name,
       status,
       requested_by,
       created_at
     )
     VALUES ($1, 'pending', $2, CURRENT_TIMESTAMP)
     RETURNING ${SPECIALTY_COLUMNS}`,
    [name, requestedBy],
  );

  return result.rows[0];
};

export const listSpecialtiesByStatus = async (status) => {
  const result = await query(
    `SELECT ${SPECIALTY_COLUMNS}
     FROM specialties
     WHERE status = $1`,
    [status],
  );

  return result.rows;
};

export const findSpecialtyById = async (specialtyId) => {
  const result = await query(
    `SELECT ${SPECIALTY_COLUMNS}
     FROM specialties
     WHERE id = $1`,
    [specialtyId],
  );

  return result.rows[0] || null;
};

export const updateSpecialtyReview = async (
  specialtyId,
  { status, reviewedBy },
) => {
  const result = await query(
    `UPDATE specialties
     SET status = $1,
         reviewed_by = $2,
         reviewed_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING ${SPECIALTY_COLUMNS}`,
    [status, reviewedBy, specialtyId],
  );

  return result.rows[0] || null;
};
