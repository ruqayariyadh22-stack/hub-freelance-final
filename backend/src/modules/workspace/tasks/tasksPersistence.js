import { query } from '../../../config/db.js';

const TASK_COLUMNS = `
  id,
  contract_id,
  title,
  description,
  status,
  due_date
`;

const isInvalidDate = (error) =>
  error?.code === '22007' || error?.code === '22008';

export const listTasksByContractId = async (contractId) => {
  const result = await query(
    `SELECT ${TASK_COLUMNS}
     FROM tasks
     WHERE contract_id = $1`,
    [contractId],
  );

  return result.rows;
};

export const findTaskById = async (taskId) => {
  const result = await query(
    `SELECT ${TASK_COLUMNS}
     FROM tasks
     WHERE id = $1`,
    [taskId],
  );

  return result.rows[0] || null;
};

export const insertTask = async ({
  contractId,
  title,
  description,
  status,
  dueDate,
}) => {
  try {
    const result = await query(
      `INSERT INTO tasks (
         contract_id,
         title,
         description,
         status,
         due_date
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${TASK_COLUMNS}`,
      [contractId, title, description, status, dueDate],
    );

    return result.rows[0];
  } catch (error) {
    if (isInvalidDate(error)) {
      error.statusCode = 400;
    }

    throw error;
  }
};

export const updateTaskStatusById = async (taskId, status) => {
  const result = await query(
    `UPDATE tasks
     SET status = $1
     WHERE id = $2
     RETURNING ${TASK_COLUMNS}`,
    [status, taskId],
  );

  return result.rows[0] || null;
};
