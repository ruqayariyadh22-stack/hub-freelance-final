import { query } from '../../../config/db.js';

const SKILL_COLUMNS = `
  id,
  name
`;

const FREELANCER_SKILL_COLUMNS = `
  id,
  freelancer_id,
  skill_id
`;

export const findSkillById = async (skillId) => {
  const result = await query(
    `SELECT ${SKILL_COLUMNS}
     FROM skills
     WHERE id = $1`,
    [skillId],
  );

  return result.rows[0] || null;
};

export const findFreelancerSkill = async (freelancerId, skillId) => {
  const result = await query(
    `SELECT ${FREELANCER_SKILL_COLUMNS}
     FROM freelancer_skills
     WHERE freelancer_id = $1 AND skill_id = $2`,
    [freelancerId, skillId],
  );

  return result.rows[0] || null;
};

export const listSkillNamesByFreelancerId = async (freelancerId) => {
  const result = await query(
    `SELECT s.id, s.name
     FROM freelancer_skills fs
     INNER JOIN skills s ON s.id = fs.skill_id
     WHERE fs.freelancer_id = $1
     ORDER BY s.name ASC`,
    [freelancerId],
  );

  return result.rows;
};

export const insertFreelancerSkill = async (freelancerId, skillId) => {
  const result = await query(
    `INSERT INTO freelancer_skills (
       freelancer_id,
       skill_id
     )
     VALUES ($1, $2)
     RETURNING ${FREELANCER_SKILL_COLUMNS}`,
    [freelancerId, skillId],
  );

  return result.rows[0];
};
