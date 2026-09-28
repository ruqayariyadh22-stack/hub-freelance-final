import { query } from '../../config/db.js';

const DISPUTE_COLUMNS = `
  id,
  reported_by,
  reported_against,
  project_id,
  issue_type,
  description,
  evidence_attachments,
  status,
  action_taken
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const findDisputeById = async (disputeId) => {
  const result = await query(
    `SELECT ${DISPUTE_COLUMNS}
     FROM disputes
     WHERE id = $1`,
    [disputeId],
  );

  return result.rows[0] || null;
};

export const insertDispute = async (
  {
    reportedBy,
    reportedAgainst,
    projectId,
    issueType,
    description,
    evidenceAttachments,
  },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO disputes (
       reported_by,
       reported_against,
       project_id,
       issue_type,
       description,
       evidence_attachments,
       status,
       action_taken
     )
     VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL)
     RETURNING ${DISPUTE_COLUMNS}`,
    [
      reportedBy,
      reportedAgainst,
      projectId,
      issueType,
      description,
      evidenceAttachments,
    ],
  );

  return result.rows[0];
};

export const freelancerHasProposalOnProject = async (projectId, freelancerId) => {
  const result = await query(
    `SELECT id
     FROM proposals
     WHERE project_id = $1
       AND freelancer_id = $2`,
    [projectId, freelancerId],
  );

  return result.rowCount > 0;
};
