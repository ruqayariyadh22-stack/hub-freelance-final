import app from '../../app.js';
import { pool, query } from '../../config/db.js';
import { signAccessToken } from '../../utils/jwt.js';
import { setGeminiCompletionForTests } from './geminiClient.js';

const results = [];
const createdUsageIds = [];

const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const assert = (name, condition, detail) => {
  record(name, Boolean(condition), condition ? undefined : detail);
};

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

const tokenFor = (user) =>
  signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

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

const allIdsForUser = async (userId) => {
  const result = await query(
    'SELECT id FROM ai_usage_logs WHERE user_id = $1 ORDER BY id',
    [userId],
  );
  return result.rows.map((row) => row.id);
};

const trackCreated = (payload) => {
  const id = payload?.id;
  if (Number.isInteger(id)) {
    createdUsageIds.push(id);
  }
  return id;
};

let server;

try {
  setGeminiCompletionForTests(async () => 'stubbed analysis');

  const beforeUsage = await query(
    'SELECT id, user_id FROM ai_usage_logs ORDER BY id',
  );
  const beforeIds = new Set(beforeUsage.rows.map((row) => row.id));

  const migration = await query(
    `SELECT id
     FROM schema_migrations
     WHERE id = '022_ai_usage_created_at'`,
  );
  assert(
    'migration_022_recorded',
    migration.rows.length === 1,
    '022_ai_usage_created_at missing from schema_migrations',
  );

  const columns = await query(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'ai_usage_logs'
     ORDER BY ordinal_position`,
  );
  const columnNames = columns.rows.map((row) => row.column_name);
  const createdAt = columns.rows.find((row) => row.column_name === 'created_at');
  assert(
    'created_at_column',
    createdAt?.data_type === 'timestamp without time zone' &&
      createdAt.is_nullable === 'NO' &&
      String(createdAt.column_default || '').toLowerCase().includes('current_timestamp'),
    JSON.stringify(createdAt),
  );
  assert(
    'usage_columns_preserved',
    columnNames.includes('id') &&
      columnNames.includes('user_id') &&
      columnNames.includes('created_at'),
    JSON.stringify(columnNames),
  );

  const index = await query(
    `SELECT indexname
     FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename = 'ai_usage_logs'
       AND indexname = 'ai_usage_logs_user_id_created_at_idx'`,
  );
  assert('usage_date_index', index.rows.length === 1, 'index missing');

  const users = await query(
    `SELECT id, email, role, account_status
     FROM users
     WHERE account_status = 'active'
     ORDER BY id`,
  );
  const freelancers = users.rows.filter((row) => row.role === 'freelancer');
  const clients = users.rows.filter((row) => row.role === 'client');
  assert('freelancer_users_available', freelancers.length >= 2, 'need two freelancers');
  assert('client_users_available', clients.length >= 1, 'need one client');

  const freelancerToday = [];
  for (const freelancer of freelancers) {
    freelancerToday.push({
      ...freelancer,
      today: await todayCount(freelancer.id),
    });
  }
  freelancerToday.sort((left, right) => left.today - right.today);

  const freelancerA = freelancerToday.find((row) => row.today === 0) || freelancerToday[0];
  const freelancerB =
    freelancerToday.find((row) => row.id !== freelancerA.id) || freelancerToday[1];
  const clientA = clients[0];
  assert(
    'freelancer_a_has_no_today_usage',
    freelancerA.today === 0,
    `freelancer ${freelancerA.id} already has ${freelancerA.today} today`,
  );

  const yesterday = await query(
    `INSERT INTO ai_usage_logs (user_id, created_at)
     VALUES ($1, CURRENT_DATE - INTERVAL '1 day')
     RETURNING id, user_id, created_at`,
    [freelancerA.id],
  );
  trackCreated(yesterday.rows[0]);

  const todayBeforeA = await todayCount(freelancerA.id);
  assert(
    'test_f_yesterday_not_counted',
    todayBeforeA === 0,
    `today count after yesterday insert: ${todayBeforeA}`,
  );

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const freelancerAToken = tokenFor(freelancerA);
  const freelancerBToken = tokenFor(freelancerB);
  const clientAToken = tokenFor(clientA);

  const postAi = (path, token, body = {}) =>
    requestJson(base, path, { method: 'POST', token, body });

  const first = await postAi('/api/ai/project-analysis', freelancerAToken);
  assert(
    'test_a_first_usage_allowed',
    first.status === 201 && first.json?.success === true && first.json?.data?.user_id === freelancerA.id,
    JSON.stringify(first),
  );
  trackCreated(first.json?.data);
  assert(
    'test_a_one_usage_log',
    (await todayCount(freelancerA.id)) === 1,
    `today=${await todayCount(freelancerA.id)}`,
  );

  const secondThroughFifth = [];
  for (let index = 2; index <= 5; index += 1) {
    const response = await postAi('/api/ai/project-analysis', freelancerAToken);
    secondThroughFifth.push(response);
    trackCreated(response.json?.data);
    assert(
      `test_b_usage_${index}_allowed`,
      response.status === 201 && response.json?.success === true,
      JSON.stringify(response),
    );
  }
  assert(
    'test_b_five_today_logs',
    (await todayCount(freelancerA.id)) === 5,
    `today=${await todayCount(freelancerA.id)}`,
  );

  const sixth = await postAi('/api/ai/project-analysis', freelancerAToken);
  assert(
    'test_c_sixth_http_429',
    sixth.status === 429 &&
      sixth.json?.success === false &&
      typeof sixth.json?.message === 'string' &&
      sixth.json.message.toLowerCase().includes('daily ai usage limit'),
    JSON.stringify(sixth),
  );
  assert(
    'test_c_no_sixth_log',
    (await todayCount(freelancerA.id)) === 5,
    `today=${await todayCount(freelancerA.id)}`,
  );

  const otherBefore = await todayCount(freelancerB.id);
  const otherFirst = await postAi('/api/ai/project-analysis', freelancerBToken);
  assert(
    'test_d_other_user_allowed',
    otherFirst.status === 201 && otherFirst.json?.data?.user_id === freelancerB.id,
    JSON.stringify(otherFirst),
  );
  trackCreated(otherFirst.json?.data);
  assert(
    'test_d_independent_count',
    (await todayCount(freelancerB.id)) === otherBefore + 1,
    `today=${await todayCount(freelancerB.id)} before=${otherBefore}`,
  );

  const injected = await postAi('/api/ai/project-analysis', freelancerBToken, {
    user_id: 999,
  });
  assert(
    'test_e_identity_rejected',
    injected.status === 400 && injected.json?.success === false,
    JSON.stringify(injected),
  );
  const foreignLogs = await query(
    'SELECT id FROM ai_usage_logs WHERE user_id = 999',
  );
  assert('test_e_no_foreign_log', foreignLogs.rows.length === 0);

  const createdAtInjected = await postAi(
    '/api/ai/project-analysis',
    freelancerBToken,
    { created_at: '2000-01-01T00:00:00.000Z' },
  );
  assert(
    'test_e_created_at_rejected',
    createdAtInjected.status === 400,
    JSON.stringify(createdAtInjected),
  );

  const budget = await postAi('/api/ai/budget-analysis', freelancerBToken);
  assert(
    'test_g_budget_analysis',
    budget.status === 201 && budget.json?.data?.user_id === freelancerB.id,
    JSON.stringify(budget),
  );
  trackCreated(budget.json?.data);

  const matching = await postAi('/api/ai/freelancer-matching', clientAToken);
  assert(
    'test_g_freelancer_matching',
    matching.status === 201 && matching.json?.data?.user_id === clientA.id,
    JSON.stringify(matching),
  );
  trackCreated(matching.json?.data);

  const description = await postAi('/api/ai/description-assistant', clientAToken);
  assert(
    'test_g_description_assistant',
    description.status === 201 && description.json?.data?.user_id === clientA.id,
    JSON.stringify(description),
  );
  trackCreated(description.json?.data);

  const usageA = await requestJson(base, '/api/ai/usage', {
    token: freelancerAToken,
  });
  const usageAIds = (usageA.json?.data || []).map((row) => row.id);
  const dbAIds = await allIdsForUser(freelancerA.id);
  const otherUserLeak = (usageA.json?.data || []).some(
    (row) => row.user_id !== freelancerA.id,
  );
  assert(
    'get_usage_own_records',
    usageA.status === 200 &&
      usageA.json?.success === true &&
      otherUserLeak === false &&
      JSON.stringify(usageAIds.sort((a, b) => a - b)) ===
        JSON.stringify(dbAIds.slice().sort((a, b) => a - b)),
    JSON.stringify({ usageA, dbAIds }),
  );
  assert(
    'get_usage_includes_created_at',
    (usageA.json?.data || []).every((row) => row.created_at),
    JSON.stringify(usageA.json?.data),
  );

  const leftoverToday = await query(
    `SELECT id
     FROM ai_usage_logs
     WHERE user_id = $1
       AND created_at::date = CURRENT_DATE
       AND id <> ALL($2::int[])`,
    [freelancerA.id, createdUsageIds.length ? createdUsageIds : [0]],
  );
  assert(
    'test_f_prior_day_excluded_from_limit',
    leftoverToday.rows.length === 0 && (await todayCount(freelancerA.id)) === 5,
    `leftover=${JSON.stringify(leftoverToday.rows)} today=${await todayCount(freelancerA.id)}`,
  );

  const remainingForB = 5 - (await todayCount(freelancerB.id));
  for (let index = 0; index < remainingForB; index += 1) {
    const fill = await postAi('/api/ai/budget-analysis', freelancerBToken);
    if (fill.status === 201) {
      trackCreated(fill.json?.data);
    }
  }
  const concurrent = await Promise.all([
    postAi('/api/ai/budget-analysis', freelancerBToken),
    postAi('/api/ai/budget-analysis', freelancerBToken),
  ]);
  const concurrentSuccess = concurrent.filter((item) => item.status === 201);
  const concurrentRejected = concurrent.filter((item) => item.status === 429);
  concurrentSuccess.forEach((item) => trackCreated(item.json?.data));
  assert(
    'concurrency_does_not_exceed_limit',
    concurrentSuccess.length === 0 &&
      concurrentRejected.length === 2 &&
      (await todayCount(freelancerB.id)) === 5,
    JSON.stringify({
      statuses: concurrent.map((item) => item.status),
      today: await todayCount(freelancerB.id),
    }),
  );

  if (createdUsageIds.length) {
    await query('DELETE FROM ai_usage_logs WHERE id = ANY($1::int[])', [
      createdUsageIds,
    ]);
  }

  const afterUsage = await query(
    'SELECT id, user_id FROM ai_usage_logs ORDER BY id',
  );
  assert(
    'preexisting_usage_restored',
    JSON.stringify(beforeUsage.rows) === JSON.stringify(afterUsage.rows),
    JSON.stringify({ before: beforeUsage.rows, after: afterUsage.rows }),
  );
} catch (error) {
  record('test_runner', false, error.stack || error.message);
} finally {
  setGeminiCompletionForTests(null);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    if (createdUsageIds.length) {
      await query('DELETE FROM ai_usage_logs WHERE id = ANY($1::int[])', [
        createdUsageIds,
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
