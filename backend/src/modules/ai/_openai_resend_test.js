import app from '../../app.js';
import { pool, query } from '../../config/db.js';
import { signAccessToken } from '../../utils/jwt.js';
import { setPasswordResetEmailForTests } from '../../services/emailService.js';
import { setGeminiCompletionForTests } from './geminiClient.js';

const results = [];
const createdUsageIds = [];
const createdResetTokenIds = [];

const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const assert = (name, condition, detail) => {
  record(name, Boolean(condition), condition ? undefined : detail);
};

const tokenFor = (user) =>
  signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

const requestJson = async (baseUrl, path, { method = 'GET', token, body } = {}) => {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  return { status: response.status, json };
};

const todayCount = async (userId) => {
  const result = await query(
    `SELECT COUNT(*)::int AS n
     FROM ai_usage_logs
     WHERE user_id = $1
       AND created_at::date = CURRENT_DATE`,
    [userId],
  );
  return result.rows[0].n;
};

const trackUsage = (payload) => {
  if (Number.isInteger(payload?.id)) {
    createdUsageIds.push(payload.id);
  }
};

let server;

try {
  const geminiCalls = [];
  setGeminiCompletionForTests(async ({ action }) => {
    geminiCalls.push(action);
    return `gemini-result:${action}`;
  });

  const emailCalls = [];
  setPasswordResetEmailForTests(async (payload) => {
    emailCalls.push(payload);
  });

  const users = await query(
    `SELECT id, email, role, account_status
     FROM users
     WHERE account_status = 'active'
     ORDER BY id`,
  );
  const freelancers = users.rows.filter((row) => row.role === 'freelancer');
  const clients = users.rows.filter((row) => row.role === 'client');
  assert('users_ready', freelancers.length >= 2 && clients.length >= 1);

  const freelancerToday = [];
  for (const freelancer of freelancers) {
    freelancerToday.push({
      ...freelancer,
      today: await todayCount(freelancer.id),
    });
  }
  freelancerToday.sort((left, right) => left.today - right.today);

  const freelancerA =
    freelancerToday.find((row) => row.today <= 3) || freelancerToday[0];
  const freelancerB =
    freelancerToday.find((row) => row.id !== freelancerA.id && row.today < 5) ||
    freelancerToday.find((row) => row.id !== freelancerA.id);
  const clientA = clients[0];
  assert(
    'freelancer_quota_available',
    freelancerA.today <= 3 && freelancerB && freelancerB.today < 5,
    JSON.stringify(freelancerToday),
  );

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const freelancerAToken = tokenFor(freelancerA);
  const freelancerBToken = tokenFor(freelancerB);
  const clientAToken = tokenFor(clientA);

  const postAi = (path, token) =>
    requestJson(base, path, { method: 'POST', token, body: {} });

  geminiCalls.length = 0;
  const first = await postAi('/api/ai/project-analysis', freelancerAToken);
  trackUsage(first.json?.data);
  assert(
    'gemini_test1_called_and_returned',
    first.status === 201 &&
      first.json?.success === true &&
      first.json?.data?.user_id === freelancerA.id &&
      first.json?.data?.result === 'gemini-result:project-analysis' &&
      geminiCalls.length === 1,
    JSON.stringify({ first, geminiCalls }),
  );

  const budget = await postAi('/api/ai/budget-analysis', freelancerAToken);
  trackUsage(budget.json?.data);
  const matching = await postAi('/api/ai/freelancer-matching', clientAToken);
  trackUsage(matching.json?.data);
  const description = await postAi('/api/ai/description-assistant', clientAToken);
  trackUsage(description.json?.data);
  assert(
    'all_four_endpoints_connected',
    budget.status === 201 &&
      matching.status === 201 &&
      description.status === 201 &&
      budget.json?.data?.result === 'gemini-result:budget-analysis' &&
      matching.json?.data?.result === 'gemini-result:freelancer-matching' &&
      description.json?.data?.result === 'gemini-result:description-assistant',
    JSON.stringify({ budget, matching, description }),
  );

  const needFill = 5 - (await todayCount(freelancerA.id));
  for (let index = 0; index < needFill; index += 1) {
    const fill = await postAi('/api/ai/project-analysis', freelancerAToken);
    trackUsage(fill.json?.data);
  }

  geminiCalls.length = 0;
  const sixth = await postAi('/api/ai/project-analysis', freelancerAToken);
  assert(
    'gemini_test2_sixth_is_429_without_provider',
    sixth.status === 429 &&
      sixth.json?.success === false &&
      geminiCalls.length === 0 &&
      (await todayCount(freelancerA.id)) === 5,
    JSON.stringify({ sixth, geminiCalls }),
  );

  geminiCalls.length = 0;
  const other = await postAi('/api/ai/project-analysis', freelancerBToken);
  trackUsage(other.json?.data);
  assert(
    'gemini_test3_other_user_independent',
    other.status === 201 &&
      other.json?.data?.user_id === freelancerB.id &&
      geminiCalls.length === 1,
    JSON.stringify({ other, geminiCalls }),
  );

  setGeminiCompletionForTests(async () => {
    throw new Error('sk-test-leaked-key-must-not-appear');
  });
  const beforeFailCount = await todayCount(freelancerB.id);
  const failed = await postAi('/api/ai/budget-analysis', freelancerBToken);
  const leaked =
    JSON.stringify(failed).includes('sk-test-leaked-key-must-not-appear') ||
    JSON.stringify(failed).includes('GEMINI_API_KEY');
  assert(
    'gemini_test4_controlled_error',
    failed.status === 503 &&
      failed.json?.success === false &&
      failed.json?.message === 'Unable to complete AI request' &&
      leaked === false,
    JSON.stringify(failed),
  );
  assert(
    'gemini_test4_failed_call_not_logged',
    (await todayCount(freelancerB.id)) === beforeFailCount,
  );

  setGeminiCompletionForTests(async ({ action }) => `gemini-result:${action}`);

  const tokensBefore = await query(
    `SELECT id
     FROM password_reset_tokens
     WHERE user_id = $1
     ORDER BY id`,
    [clientA.id],
  );

  emailCalls.length = 0;
  const forgot = await requestJson(base, '/api/auth/forgot-password', {
    method: 'POST',
    body: { email: clientA.email },
  });
  const tokensAfter = await query(
    `SELECT id, user_id, used_at
     FROM password_reset_tokens
     WHERE user_id = $1
     ORDER BY id DESC`,
    [clientA.id],
  );
  const newTokens = tokensAfter.rows.filter(
    (row) => !tokensBefore.rows.some((before) => before.id === row.id),
  );
  newTokens.forEach((row) => createdResetTokenIds.push(row.id));

  assert(
    'email_reset_invokes_resend_path',
    forgot.status === 200 &&
      forgot.json?.success === true &&
      emailCalls.length === 1 &&
      emailCalls[0].to === clientA.email &&
      typeof emailCalls[0].resetToken === 'string' &&
      emailCalls[0].resetToken.length > 0 &&
      (emailCalls[0].resetUrl === '' ||
        emailCalls[0].resetUrl.includes('/reset-password')) &&
      newTokens.length === 1,
    JSON.stringify({ forgot, emailCalls, newTokens }),
  );

  setPasswordResetEmailForTests(async () => {
    throw new Error('re_test_leaked_resend_key');
  });
  const forgotFail = await requestJson(base, '/api/auth/forgot-password', {
    method: 'POST',
    body: { email: clientA.email },
  });
  const failLeak =
    JSON.stringify(forgotFail).includes('re_test_leaked_resend_key') ||
    JSON.stringify(forgotFail).includes('RESEND_API_KEY');
  assert(
    'email_provider_failure_controlled',
    forgotFail.status === 503 &&
      forgotFail.json?.success === false &&
      forgotFail.json?.message === 'Unable to send password reset email' &&
      failLeak === false,
    JSON.stringify(forgotFail),
  );

  const failTokens = await query(
    `SELECT id
     FROM password_reset_tokens
     WHERE user_id = $1
       AND id <> ALL($2::int[])`,
    [clientA.id, tokensBefore.rows.map((row) => row.id).concat(createdResetTokenIds, [0])],
  );
  failTokens.rows.forEach((row) => createdResetTokenIds.push(row.id));
} catch (error) {
  record('test_runner', false, error.stack || error.message);
} finally {
  setGeminiCompletionForTests(null);
  setPasswordResetEmailForTests(null);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    if (createdUsageIds.length) {
      await query('DELETE FROM ai_usage_logs WHERE id = ANY($1::int[])', [
        createdUsageIds,
      ]);
    }
    if (createdResetTokenIds.length) {
      await query('DELETE FROM password_reset_tokens WHERE id = ANY($1::int[])', [
        createdResetTokenIds,
      ]);
    }
  } catch (cleanupError) {
    record('cleanup', false, cleanupError.message);
  }

  await pool.end();

  const failed = results.filter((item) => !item.ok);
  console.log(
    JSON.stringify(
      {
        passed: results.filter((item) => item.ok).length,
        failed: failed.length,
        failures: failed,
      },
      null,
      2,
    ),
  );
  process.exit(failed.length ? 1 : 0);
}
