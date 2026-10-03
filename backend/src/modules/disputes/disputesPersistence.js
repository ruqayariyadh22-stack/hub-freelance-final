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
  action_taken,
  created_at
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

export const listDisputesForUser = async (userId) => {
  const result = await query(
    `SELECT
       d.id,
       d.reported_by,
       d.reported_against,
       d.project_id,
       d.issue_type,
       d.description,
       d.evidence_attachments,
       d.status,
       d.action_taken,
       d.created_at,
       p.title AS project_title,
       c.id AS contract_id,
       reporter.name AS reported_by_name,
       against.name AS reported_against_name
     FROM disputes d
     INNER JOIN projects p ON p.id = d.project_id
     LEFT JOIN contracts c ON c.project_id = d.project_id
     LEFT JOIN users reporter ON reporter.id = d.reported_by
     LEFT JOIN users against ON against.id = d.reported_against
     LEFT JOIN client_profiles cp ON cp.id = p.client_id
     LEFT JOIN freelancer_profiles fp ON fp.id = p.chosen_freelancer_id
     WHERE d.reported_by = $1
        OR d.reported_against = $1
        OR cp.user_id = $1
        OR fp.user_id = $1
     ORDER BY d.created_at DESC, d.id DESC`,
    [userId],
  );

  return result.rows;
};
