import { AppError } from '../../../utils/appError.js';
import { findClientProfileByUserId } from '../../projects/projectsPersistence.js';
import { findProjectById } from '../../projects/projectsPersistence.js';
import { listProposalsByProjectId } from '../../proposals/proposalsPersistence.js';
import { findFreelancerProfileById } from '../../freelancer/freelancerPersistence.js';
import { findSpecialtyById } from '../../freelancer/specialties/specialtiesPersistence.js';
import { listSkillNamesByFreelancerId } from '../../freelancer/skills/skillsPersistence.js';
import { findPortfolioItemsByFreelancerId } from '../../freelancer/portfolio/portfolioPersistence.js';
import {
  assertMonthlyMatchingUsageAvailable,
  FREELANCER_MATCHING_ACTION,
  getMatchingMonthlyUsageSummary,
  runMeteredAiCompletion,
} from '../aiUsageService.js';
import { parseJsonFromAiText } from '../geminiClient.js';

const clampScore = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  const rounded = Math.round(value);
  if (rounded < 0 || rounded > 100) {
    return null;
  }
  return rounded;
};

const toMatchingRow = (raw, allowedFreelancerIds) => {
  const freelancerId = Number(raw?.freelancerId ?? raw?.freelancer_id);
  if (!Number.isInteger(freelancerId) || !allowedFreelancerIds.has(freelancerId)) {
    return null;
  }

  const skillsMatch = clampScore(Number(raw.skillsMatch));
  const experienceMatch = clampScore(Number(raw.experienceMatch));
  const specialtyMatch = clampScore(Number(raw.specialtyMatch));
  const portfolioRelevance = clampScore(Number(raw.portfolioRelevance));
  const ratingsMatch = clampScore(Number(raw.ratingsMatch));

  if (
    skillsMatch === null ||
    experienceMatch === null ||
    specialtyMatch === null ||
    portfolioRelevance === null ||
    ratingsMatch === null
  ) {
    return null;
  }

  // Deterministic overall from the five required factors.
  const overallScore = Math.round(
    (skillsMatch +
      experienceMatch +
      specialtyMatch +
      portfolioRelevance +
      ratingsMatch) /
      5,
  );

  const recommendation =
    typeof raw.recommendation === 'string' ? raw.recommendation.trim() : '';
  const explanation =
    typeof raw.explanation === 'string' ? raw.explanation.trim() : '';

  return {
    freelancerId,
    skillsMatch,
    experienceMatch,
    specialtyMatch,
    portfolioRelevance,
    ratingsMatch,
    overallScore,
    recommendation,
    explanation,
    aiRecommendation: recommendation,
    aiPros: explanation ? [explanation] : [],
  };
};

const validateMatchingPayload = (parsed, allowedFreelancerIds) => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AppError('Unable to complete AI request', 503);
  }

  const matchesRaw = parsed.matches;
  if (!Array.isArray(matchesRaw)) {
    throw new AppError('Unable to complete AI request', 503);
  }

  const byFreelancer = new Map();

  for (const row of matchesRaw) {
    const normalized = toMatchingRow(row, allowedFreelancerIds);
    if (!normalized) {
      throw new AppError('Unable to complete AI request', 503);
    }
    byFreelancer.set(normalized.freelancerId, normalized);
  }

  if (byFreelancer.size !== allowedFreelancerIds.size) {
    throw new AppError('Unable to complete AI request', 503);
  }

  return Array.from(byFreelancer.values());
};

const loadFreelancerMatchingProfile = async (freelancerId) => {
  const profile = await findFreelancerProfileById(freelancerId);
  if (!profile) {
    return null;
  }

  const specialty = profile.specialty_id
    ? await findSpecialtyById(profile.specialty_id)
    : null;
  const skills = await listSkillNamesByFreelancerId(freelancerId);
  const portfolioItems = await findPortfolioItemsByFreelancerId(freelancerId);

  return {
    id: profile.id,
    experience_years: profile.experience_years,
    rating_avg: profile.rating_avg,
    completed_projects_count: profile.completed_projects_count,
    bio: profile.bio,
    specialization: specialty
      ? { id: specialty.id, name: specialty.name }
      : null,
    skills: skills.map((skill) => ({ id: skill.id, name: skill.name })),
    portfolio: portfolioItems.slice(0, 10).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
    })),
  };
};

export const matchFreelancers = async (actor, payload) => {
  if (!actor?.id) {
    throw new AppError('Authentication required', 401);
  }

  const clientProfile = await findClientProfileByUserId(actor.id);
  if (!clientProfile) {
    throw new AppError('Client not found', 404);
  }

  const project = await findProjectById(payload.project_id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.client_id !== clientProfile.id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  const proposals = await listProposalsByProjectId(project.id);
  const freelancerIds = [
    ...new Set(proposals.map((proposal) => proposal.freelancer_id)),
  ];

  const freelancers = [];
  for (const freelancerId of freelancerIds) {
    const row = await loadFreelancerMatchingProfile(freelancerId);
    if (row) {
      freelancers.push(row);
    }
  }

  const allowedFreelancerIds = new Set(freelancers.map((row) => row.id));

  if (allowedFreelancerIds.size === 0) {
    const usage = await getMatchingMonthlyUsageSummary(actor);
    return {
      project_id: project.id,
      matches: [],
      usage,
    };
  }

  const context = {
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      budget_min: project.budget_min,
      budget_max: project.budget_max,
      duration: project.duration,
      required_skills: project.required_skills,
      status: project.status,
    },
    freelancers,
  };

  const { usage, result } = await runMeteredAiCompletion({
    actor,
    action: FREELANCER_MATCHING_ACTION,
    context,
    assertUsage: assertMonthlyMatchingUsageAvailable,
  });

  const parsed = parseJsonFromAiText(result);
  const matches = validateMatchingPayload(parsed, allowedFreelancerIds);
  const usageSummary = await getMatchingMonthlyUsageSummary(actor);

  return {
    project_id: project.id,
    matches,
    usage: {
      ...usageSummary,
      last_usage_id: usage.id,
    },
  };
};
