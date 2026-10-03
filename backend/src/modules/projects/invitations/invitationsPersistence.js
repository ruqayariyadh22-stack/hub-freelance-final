import { query } from '../../../config/db.js';

const INVITATION_COLUMNS = `
  i.id,
  i.project_id,
  i.freelancer_id,
  i.invited_by,
  i.status,
  i.created_at
`;

export const insertInvitation = async ({ projectId, freelancerId, invitedBy }) => {
  const result = await query(
    `INSERT INTO project_invitations (project_id, freelancer_id, invited_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, freelancer_id) DO NOTHING
     RETURNING id, project_id, freelancer_id, invited_by, status, created_at`,
    [projectId, freelancerId, invitedBy],
  );

  return result.rows[0] || null;
};

export const findInvitationById = async (invitationId) => {
  const result = await query(
    `SELECT ${INVITATION_COLUMNS}
     FROM project_invitations i
     WHERE i.id = $1`,
    [invitationId],
  );

  return result.rows[0] || null;
};

export const listInvitationsByProjectId = async (projectId) => {
  const result = await query(
    `SELECT ${INVITATION_COLUMNS},
       u.name AS freelancer_name
     FROM project_invitations i
     LEFT JOIN freelancer_profiles fp ON fp.id = i.freelancer_id
     LEFT JOIN users u ON u.id = fp.user_id
     WHERE i.project_id = $1
     ORDER BY i.created_at DESC, i.id DESC`,
    [projectId],
  );

  return result.rows;
};

export const listInvitationsByFreelancerId = async (freelancerId) => {
  const result = await query(
    `SELECT ${INVITATION_COLUMNS},
       p.title AS project_title,
       p.budget_min,
       p.budget_max,
       p.status AS project_status,
       u.name AS client_name
     FROM project_invitations i
     INNER JOIN projects p ON p.id = i.project_id
     LEFT JOIN users u ON u.id = i.invited_by
     WHERE i.freelancer_id = $1
     ORDER BY i.created_at DESC, i.id DESC`,
    [freelancerId],
  );

  return result.rows;
};

export const updateInvitationStatusById = async (invitationId, status) => {
  const result = await query(
    `UPDATE project_invitations
     SET status = $1
     WHERE id = $2
     RETURNING id, project_id, freelancer_id, invited_by, status, created_at`,
    [status, invitationId],
  );

  return result.rows[0] || null;
};

export const markInvitationAccepted = async (projectId, freelancerId) => {
  try {
    await query(
      `UPDATE project_invitations
       SET status = 'accepted'
       WHERE project_id = $1
         AND freelancer_id = $2
         AND status = 'pending'`,
      [projectId, freelancerId],
    );
  } catch {
    // Invitation bookkeeping must never block proposal submission.
  }
};
