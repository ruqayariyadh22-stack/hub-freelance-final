import { query } from '../../config/db.js';
import { findClientProfileByUserId } from '../projects/projectsPersistence.js';
import { listProjectsByClientId } from '../projects/projectsPersistence.js';
import {
  findFreelancerProfileById,
  listFreelancerProfiles,
} from '../freelancer/freelancerPersistence.js';
import { findFreelancerProfileByUserId } from '../proposals/proposalsPersistence.js';

const toPublicProject = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  category: project.category,
  budget_min: project.budget_min,
  budget_max: project.budget_max,
  status: project.status,
});

const toPublicFreelancer = (profile) => ({
  id: profile.id,
  specialty_id: profile.specialty_id,
  bio: profile.bio,
  experience_years: profile.experience_years,
  rating_avg: profile.rating_avg,
  completed_projects_count: profile.completed_projects_count,
});

const listProjectsByChosenFreelancerId = async (freelancerId) => {
  const result = await query(
    `SELECT id, title, description, category, budget_min, budget_max, status
     FROM projects
     WHERE chosen_freelancer_id = $1
     ORDER BY id DESC
     LIMIT 10`,
    [freelancerId],
  );

  return result.rows.map(toPublicProject);
};

const listContractsByFreelancerId = async (freelancerId) => {
  const result = await query(
    `SELECT id, project_id, contract_value, status, payment_status
     FROM contracts
     WHERE freelancer_id = $1
     ORDER BY id DESC
     LIMIT 10`,
    [freelancerId],
  );

  return result.rows;
};

export const loadAiContext = async (action, actor) => {
  if (action === 'freelancer-matching' || action === 'description-assistant') {
    const clientProfile = await findClientProfileByUserId(actor.id);
    const projects = clientProfile
      ? (await listProjectsByClientId(clientProfile.id)).slice(0, 10).map(toPublicProject)
      : [];

    if (action === 'description-assistant') {
      return { projects };
    }

    const freelancers = (await listFreelancerProfiles()).slice(0, 20).map(toPublicFreelancer);
    return { projects, freelancers };
  }

  const freelancerRef = await findFreelancerProfileByUserId(actor.id);
  const profile = freelancerRef
    ? await findFreelancerProfileById(freelancerRef.id)
    : null;
  const projects = profile ? await listProjectsByChosenFreelancerId(profile.id) : [];

  if (action === 'budget-analysis') {
    const contracts = profile ? await listContractsByFreelancerId(profile.id) : [];
    return {
      profile: profile ? toPublicFreelancer(profile) : null,
      projects,
      contracts,
    };
  }

  return {
    profile: profile ? toPublicFreelancer(profile) : null,
    projects,
  };
};
