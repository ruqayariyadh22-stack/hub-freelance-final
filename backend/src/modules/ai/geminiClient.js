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
      'Using the client project information and freelancer profiles below, provide matching analysis.',
      'Do not accept proposals or choose a freelancer.',
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
