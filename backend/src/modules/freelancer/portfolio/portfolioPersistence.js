import { query } from '../../../config/db.js';

const PORTFOLIO_ITEM_COLUMNS = `
  id,
  freelancer_id,
  title,
  description,
  project_url,
  image_url,
  created_at,
  updated_at
`;

const UPDATABLE_COLUMNS = [
  'title',
  'description',
  'project_url',
  'image_url',
];

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const insertPortfolioItem = async (
  { freelancerId, title, description, projectUrl, imageUrl },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO portfolio_items (
       freelancer_id,
       title,
       description,
       project_url,
       image_url,
       created_at,
       updated_at
     )
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING ${PORTFOLIO_ITEM_COLUMNS}`,
    [freelancerId, title, description, projectUrl, imageUrl],
  );

  return result.rows[0];
};

export const findPortfolioItemsByFreelancerId = async (
  freelancerId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${PORTFOLIO_ITEM_COLUMNS}
     FROM portfolio_items
     WHERE freelancer_id = $1`,
    [freelancerId],
  );

  return result.rows;
};

export const findPortfolioItemById = async (id, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${PORTFOLIO_ITEM_COLUMNS}
     FROM portfolio_items
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

export const updatePortfolioItemById = async (id, payload, executor = query) => {
  const assignments = [];
  const values = [];

  UPDATABLE_COLUMNS.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      values.push(payload[column]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return findPortfolioItemById(id, executor);
  }

  assignments.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const result = await runQuery(
    executor,
    `UPDATE portfolio_items
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${PORTFOLIO_ITEM_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const deletePortfolioItemById = async (id, executor = query) => {
  const result = await runQuery(
    executor,
    `DELETE FROM portfolio_items
     WHERE id = $1
     RETURNING ${PORTFOLIO_ITEM_COLUMNS}`,
    [id],
  );

  return result.rows[0] || null;
};
