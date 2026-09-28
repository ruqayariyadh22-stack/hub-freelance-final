import { query } from '../../config/db.js';

const REVIEW_COLUMNS = `
  id,
  contract_id,
  reviewer_id,
  reviewee_id,
  rating,
  comment
`;

export const listReviewsByRevieweeId = async (revieweeId) => {
  const result = await query(
    `SELECT ${REVIEW_COLUMNS}
     FROM reviews
     WHERE reviewee_id = $1`,
    [revieweeId],
  );

  return result.rows;
};

export const insertReview = async ({
  contractId,
  reviewerId,
  revieweeId,
  rating,
  comment,
}) => {
  const result = await query(
    `INSERT INTO reviews (
       contract_id,
       reviewer_id,
       reviewee_id,
       rating,
       comment
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${REVIEW_COLUMNS}`,
    [contractId, reviewerId, revieweeId, rating, comment],
  );

  return result.rows[0];
};
