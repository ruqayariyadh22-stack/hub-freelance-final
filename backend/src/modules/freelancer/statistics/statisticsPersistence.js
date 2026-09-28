import { query } from '../../../config/db.js';

export const findFreelancerStatisticsByFreelancerId = async (freelancerId) => {
  const result = await query(
    `SELECT
       (
         SELECT COUNT(*)::int
         FROM projects
         WHERE chosen_freelancer_id = $1
       ) AS total_projects,
       (
         SELECT COUNT(*)::int
         FROM projects
         WHERE chosen_freelancer_id = $1
           AND status = 'completed'
       ) AS completed_projects,
       (
         SELECT COUNT(*)::int
         FROM projects
         WHERE chosen_freelancer_id = $1
           AND status = 'in_progress'
       ) AS active_projects,
       (
         SELECT COUNT(*)::int
         FROM proposals
         WHERE freelancer_id = $1
       ) AS total_proposals,
       (
         SELECT COUNT(*)::int
         FROM proposals
         WHERE freelancer_id = $1
           AND status = 'accepted'
       ) AS accepted_proposals,
       (
         SELECT COUNT(*)::int
         FROM contracts
         WHERE freelancer_id = $1
       ) AS total_contracts,
       (
         SELECT COALESCE(SUM(t.amount - COALESCE(t.commission, 0)), 0)
         FROM transactions t
         INNER JOIN contracts c ON c.id = t.contract_id
         WHERE c.freelancer_id = $1
           AND t.type = 'release'
       ) AS total_earnings`,
    [freelancerId],
  );

  return result.rows[0];
};
