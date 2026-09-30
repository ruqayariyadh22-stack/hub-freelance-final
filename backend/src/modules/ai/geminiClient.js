import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';

const PROVIDER_ERROR = 'Unable to complete AI request';

let completionOverride = null;

export const setGeminiCompletionForTests = (fn) => {
  completionOverride = fn;
};

const requireGeminiClient = () => {
  if (!env.geminiApiKey) {
    throw new AppError(PROVIDER_ERROR, 503);
  }

  return new GoogleGenAI({ apiKey: env.geminiApiKey });
};

const buildPrompt = ({ action, context }) => {
  const contextText = JSON.stringify(context, null, 2);

  if (action === 'project-analysis') {
    return [
      'You are an advisor for Hub Freelance.',
      'Analyze the freelancer project information below.',
      'Give a clear, useful project analysis.',
      'Do not approve, reject, or change any project.',
      '',
      contextText,
    ].join('\n');
  }

  if (action === 'budget-analysis') {
    return [
      'You are an advisor for Hub Freelance.',
      'Analyze the budget and contract information below.',
      'Give a clear, useful budget analysis.',
      'Do not set budgets or execute payments.',
      '',
      contextText,
    ].join('\n');
  }

  if (action === 'freelancer-matching') {
    return [
      'You are an advisor for Hub Freelance.',
      'Compare EACH proposed freelancer to the project requirements.',
      'You MUST score exactly these five factors for every freelancer (integers 0-100):',
      '1) skillsMatch — skills vs project required_skills',
      '2) experienceMatch — experience_years and completed work vs project needs',
      '3) specialtyMatch — specialization vs project category/domain',
      '4) portfolioRelevance — portfolio items fit to the project',
      '5) ratingsMatch — previous ratings / rating_avg',
      'Do not accept proposals or choose a freelancer.',
      'Do not invent missing data; score lower when data is absent.',
      'Return ONLY valid JSON (no markdown) with this exact shape:',
      '{"matches":[{"freelancerId":<number>,"skillsMatch":<0-100>,"experienceMatch":<0-100>,"specialtyMatch":<0-100>,"portfolioRelevance":<0-100>,"ratingsMatch":<0-100>,"recommendation":"<short>","explanation":"<short>"}]}',
      'Include one matches entry for every freelancer in the context. freelancers list.',
      '',
      contextText,
    ].join('\n');
  }

  if (action === 'description-assistant') {
    return [
      'You are an advisor for Hub Freelance.',
      'Create a clear, professional, structured project description for a client to publish.',
      'Use ONLY these client inputs from the context:',
      '- idea',
      '- budget_min / budget_max',
      '- duration_days',
      '- required_skills',
      'Do not publish projects or change project status.',
      'Return ONLY valid JSON (no markdown) with this exact shape:',
      '{"description":"<full project description text>"}',
      '',
      contextText,
    ].join('\n');
  }

  return [
    'You are an advisor for Hub Freelance.',
    'Improve or assist with the project description information below.',
    'Keep the result clear and professional.',
    'Do not publish projects or change project status.',
    '',
    contextText,
  ].join('\n');
};

const readOutputText = (response) => {
  if (typeof response?.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }

  throw new AppError(PROVIDER_ERROR, 503);
};

export const generateAiCompletion = async ({ action, context }) => {
  try {
    if (typeof completionOverride === 'function') {
      return await completionOverride({ action, context });
    }

    const client = requireGeminiClient();
    const response = await client.models.generateContent({
      model: env.geminiModel,
      contents: buildPrompt({ action, context }),
    });

    return readOutputText(response);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(PROVIDER_ERROR, 503);
  }
};

export const parseJsonFromAiText = (text) => {
  if (typeof text !== 'string' || !text.trim()) {
    throw new AppError('Unable to complete AI request', 503);
  }

  let candidate = text.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    candidate = fenced[1].trim();
  }

  try {
    return JSON.parse(candidate);
  } catch {
    throw new AppError('Unable to complete AI request', 503);
  }
};
