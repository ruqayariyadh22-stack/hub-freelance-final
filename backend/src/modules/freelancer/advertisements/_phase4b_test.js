import app from '../../../app.js';
import { pool, query, withTransaction } from '../../../config/db.js';
import { signAccessToken } from '../../../utils/jwt.js';
import {
  incrementMonthlyAdUsage,
  insertAdvertisement,
} from './advertisementsPersistence.js';

const results = [];
const createdAdIds = [];
const createdUsageIds = [];
const createdSubscriptionIds = [];
const createdServiceIds = [];

const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const assert = (name, condition, detail) => {
  record(name, Boolean(condition), condition ? undefined : detail);
};

const countTables = async () => {
  const tables = [
    'users',
    'freelancer_profiles',
    'services',
    'subscriptions',
    'subscription_ad_usage',
    'advertisements',
    'wallets',
    'transactions',
    'projects',
    'contracts',
  ];
  const counts = {};
  for (const table of tables) {
    const result = await query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    counts[table] = result.rows[0].n;
  }
  return counts;
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

const currentMonthUsage = async (freelancerId, subscriptionId) => {
  const result = await query(
    `SELECT id, ads_used, period_start
     FROM subscription_ad_usage
     WHERE freelancer_id = $1
       AND subscription_id = $2
       AND period_start = date_trunc('month', CURRENT_DATE)::date`,
    [freelancerId, subscriptionId],
  );
  return result.rows[0] || null;
};

const advertisementCountFor = async (subscriptionId) => {
  const result = await query(
    'SELECT COUNT(*)::int AS n FROM advertisements WHERE subscription_id = $1',
    [subscriptionId],
  );
  return result.rows[0].n;
};

let server;

try {
  const beforeCounts = await countTables();
  console.log('BEFORE_COUNTS', JSON.stringify(beforeCounts));

  const migration = await query(
    `SELECT id
     FROM schema_migrations
     WHERE id = '021_advertisements'`,
  );
  assert(
    'migration_021_recorded',
    migration.rows.length === 1,
    '021_advertisements missing from schema_migrations',
  );

  const table = await query(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'advertisements'
     ORDER BY ordinal_position`,
  );
  const columnNames = table.rows.map((row) => row.column_name);
  assert(
    'advertisements_table_exists',
    columnNames.join(',') ===
      'id,freelancer_id,service_id,subscription_id,created_at',
    JSON.stringify(columnNames),
  );

  const pk = await query(
    `SELECT kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     WHERE tc.table_schema = 'public'
       AND tc.table_name = 'advertisements'
       AND tc.constraint_type = 'PRIMARY KEY'`,
  );
  assert('advertisements_pk', pk.rows[0]?.column_name === 'id');

  const fks = await query(
    `SELECT
       kcu.column_name,
       ccu.table_name AS foreign_table,
       ccu.column_name AS foreign_column
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
     WHERE tc.table_schema = 'public'
       AND tc.table_name = 'advertisements'
       AND tc.constraint_type = 'FOREIGN KEY'
     ORDER BY kcu.column_name`,
  );
  const fkMap = Object.fromEntries(
    fks.rows.map((row) => [
      row.column_name,
      `${row.foreign_table}.${row.foreign_column}`,
    ]),
  );
  assert(
    'advertisements_fks',
    fkMap.freelancer_id === 'freelancer_profiles.id' &&
      fkMap.service_id === 'services.id' &&
      fkMap.subscription_id === 'subscriptions.id',
    JSON.stringify(fkMap),
  );

  const users = await query(
    `SELECT u.id, u.email, u.role, fp.id AS freelancer_id
     FROM users u
     LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
     WHERE u.id IN (3, 4, 5)
     ORDER BY u.id`,
  );
  const userById = Object.fromEntries(users.rows.map((row) => [row.id, row]));
  const freelancerUser = userById[5];
  const otherFreelancerUser = userById[3];
  const clientUser = userById[4];
  const freelancerId = freelancerUser.freelancer_id;
  const otherFreelancerId = otherFreelancerUser.freelancer_id;

  const ownedService = await query(
    'SELECT id, freelancer_id, is_featured FROM services WHERE id = 1',
  );
  assert(
    'owned_service_ready',
    ownedService.rows[0]?.freelancer_id === freelancerId,
    JSON.stringify(ownedService.rows[0]),
  );

  const walletBefore = await query(
    'SELECT id, user_id, balance, escrow_balance FROM wallets ORDER BY id',
  );
  const transactionsBefore = await query(
    'SELECT id, wallet_id, contract_id, type, commission, amount FROM transactions ORDER BY id',
  );

  const insertedSub = await query(
    `INSERT INTO subscriptions (
       freelancer_id,
       plan_type,
       price,
       start_date,
       end_date,
       status,
       payment_status,
       cancel_at_period_end
     )
     VALUES (
       $1,
       'Freelancer Pro',
       25000,
       CURRENT_DATE,
       CURRENT_DATE + 30,
       'active',
       'paid',
       FALSE
     )
     RETURNING id, freelancer_id, status, end_date, cancel_at_period_end`,
    [freelancerId],
  );
  const subscriptionId = insertedSub.rows[0].id;
  createdSubscriptionIds.push(subscriptionId);

  const otherService = await query(
    `INSERT INTO services (
       freelancer_id,
       title,
       description,
       category,
       price,
       delivery_time,
       status
     )
     VALUES ($1, '4B temp other service', 'temp', 'web', 100, 1, 'active')
     RETURNING id`,
    [otherFreelancerId],
  );
  const otherServiceId = otherService.rows[0].id;
  createdServiceIds.push(otherServiceId);

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const freelancerToken = signAccessToken({
    sub: freelancerUser.id,
    email: freelancerUser.email,
    role: 'freelancer',
  });
  const otherFreelancerToken = signAccessToken({
    sub: otherFreelancerUser.id,
    email: otherFreelancerUser.email,
    role: 'freelancer',
  });
  const clientToken = signAccessToken({
    sub: clientUser.id,
    email: clientUser.email,
    role: 'client',
  });

  const createAd = (token, body) =>
    requestJson(base, '/api/freelancers/me/advertisements', {
      method: 'POST',
      token,
      body,
    });

  const e = await createAd(otherFreelancerToken, { service_id: otherServiceId });
  const usageAfterE = await currentMonthUsage(freelancerId, subscriptionId);
  const adsAfterE = await advertisementCountFor(subscriptionId);
  assert(
    'E_no_active_subscription',
    e.status === 403 &&
      e.json?.message === 'Forbidden: insufficient role' &&
      usageAfterE === null &&
      adsAfterE === 0,
    JSON.stringify({ status: e.status, message: e.json?.message, usageAfterE, adsAfterE }),
  );

  const j = await createAd(clientToken, { service_id: 1 });
  assert(
    'J_client_rejected',
    j.status === 403 && j.json?.success === false,
    JSON.stringify({ status: j.status, message: j.json?.message }),
  );

  const k = await createAd(freelancerToken, {
    service_id: 1,
    freelancer_id: 999,
    subscription_id: 999,
    ads_used: 0,
  });
  const usageAfterK = await currentMonthUsage(freelancerId, subscriptionId);
  const adsAfterK = await advertisementCountFor(subscriptionId);
  assert(
    'K_body_injection',
    k.status === 400 &&
      k.json?.message === 'Validation failed' &&
      usageAfterK === null &&
      adsAfterK === 0,
    JSON.stringify({ status: k.status, json: k.json, usageAfterK, adsAfterK }),
  );

  const missing = await createAd(freelancerToken, { service_id: 999999 });
  const usageAfterMissing = await currentMonthUsage(freelancerId, subscriptionId);
  assert(
    'service_not_found',
    missing.status === 404 &&
      missing.json?.message === 'Service not found' &&
      usageAfterMissing === null,
    JSON.stringify({ status: missing.status, message: missing.json?.message }),
  );

  const i = await createAd(freelancerToken, { service_id: otherServiceId });
  const usageAfterI = await currentMonthUsage(freelancerId, subscriptionId);
  const adsAfterI = await advertisementCountFor(subscriptionId);
  assert(
    'I_other_freelancer_service',
    i.status === 403 &&
      i.json?.message === 'Forbidden: insufficient role' &&
      usageAfterI === null &&
      adsAfterI === 0,
    JSON.stringify({ status: i.status, message: i.json?.message, usageAfterI, adsAfterI }),
  );

  const a = await createAd(freelancerToken, { service_id: 1 });
  if (a.json?.data?.id) createdAdIds.push(a.json.data.id);
  const usageA = await currentMonthUsage(freelancerId, subscriptionId);
  if (usageA?.id) createdUsageIds.push(usageA.id);
  assert(
    'A_first_advertisement',
    a.status === 201 &&
      a.json?.success === true &&
      a.json.data?.service_id === 1 &&
      a.json.data?.freelancer_id === freelancerId &&
      a.json.data?.subscription_id === subscriptionId &&
      usageA?.ads_used === 1,
    JSON.stringify({ status: a.status, data: a.json?.data, usageA }),
  );

  const b = await createAd(freelancerToken, { service_id: 1 });
  if (b.json?.data?.id) createdAdIds.push(b.json.data.id);
  const usageB = await currentMonthUsage(freelancerId, subscriptionId);
  assert(
    'B_second_advertisement',
    b.status === 201 &&
      b.json?.success === true &&
      b.json.data?.id &&
      usageB?.ads_used === 2,
    JSON.stringify({ status: b.status, data: b.json?.data, usageB }),
  );

  const adsBeforeC = await advertisementCountFor(subscriptionId);
  const c = await createAd(freelancerToken, { service_id: 1 });
  const usageC = await currentMonthUsage(freelancerId, subscriptionId);
  const adsAfterC = await advertisementCountFor(subscriptionId);
  assert(
    'C_third_blocked',
    c.status === 409 &&
      c.json?.message === 'Monthly advertisement limit reached' &&
      usageC?.ads_used === 2 &&
      adsAfterC === adsBeforeC,
    JSON.stringify({
      status: c.status,
      message: c.json?.message,
      usageC,
      adsBeforeC,
      adsAfterC,
    }),
  );

  const mine = await requestJson(base, '/api/freelancers/me/advertisements', {
    token: freelancerToken,
  });
  assert(
    'GET_me_advertisements',
    mine.status === 200 &&
      Array.isArray(mine.json?.data) &&
      mine.json.data.length === 2 &&
      mine.json.data.every((row) => row.subscription_id === subscriptionId),
    JSON.stringify({ status: mine.status, count: mine.json?.data?.length }),
  );

  const published = await requestJson(base, '/api/advertisements');
  const publicOk =
    published.status === 200 &&
    Array.isArray(published.json?.data) &&
    published.json.data.some((row) => createdAdIds.includes(row.id)) &&
    published.json.data.every(
      (row) =>
        !Object.prototype.hasOwnProperty.call(row, 'subscription_id') &&
        row.service &&
        typeof row.service.id === 'number',
    );
  assert(
    'public_advertisements',
    publicOk,
    JSON.stringify({
      status: published.status,
      sample: published.json?.data?.[0],
    }),
  );

  await query(
    `UPDATE subscription_ad_usage
     SET period_start = (date_trunc('month', CURRENT_DATE)::date - INTERVAL '1 month')::date
     WHERE id = $1`,
    [usageC.id],
  );

  const d = await createAd(freelancerToken, { service_id: 1 });
  if (d.json?.data?.id) createdAdIds.push(d.json.data.id);
  const usageD = await currentMonthUsage(freelancerId, subscriptionId);
  if (usageD?.id) createdUsageIds.push(usageD.id);
  const priorMonth = await query(
    `SELECT ads_used
     FROM subscription_ad_usage
     WHERE id = $1`,
    [usageC.id],
  );
  assert(
    'D_new_calendar_month',
    d.status === 201 &&
      usageD?.ads_used === 1 &&
      priorMonth.rows[0]?.ads_used === 2,
    JSON.stringify({
      status: d.status,
      usageD,
      prior: priorMonth.rows[0],
    }),
  );

  await query(
    `UPDATE subscriptions
     SET cancel_at_period_end = TRUE
     WHERE id = $1`,
    [subscriptionId],
  );
  const h = await createAd(freelancerToken, { service_id: 1 });
  if (h.json?.data?.id) createdAdIds.push(h.json.data.id);
  const usageH = await currentMonthUsage(freelancerId, subscriptionId);
  assert(
    'H_cancel_at_period_end_still_active',
    h.status === 201 && usageH?.ads_used === 2,
    JSON.stringify({ status: h.status, data: h.json?.data, usageH }),
  );

  await query(
    `UPDATE subscriptions
     SET status = 'cancelled'
     WHERE id = $1`,
    [subscriptionId],
  );
  const adsBeforeG = await advertisementCountFor(subscriptionId);
  const g = await createAd(freelancerToken, { service_id: 1 });
  const usageG = await currentMonthUsage(freelancerId, subscriptionId);
  const adsAfterG = await advertisementCountFor(subscriptionId);
  assert(
    'G_cancelled_subscription',
    g.status === 403 &&
      usageG?.ads_used === 2 &&
      adsAfterG === adsBeforeG,
    JSON.stringify({
      status: g.status,
      message: g.json?.message,
      usageG,
      adsBeforeG,
      adsAfterG,
    }),
  );

  await query(
    `UPDATE subscriptions
     SET status = 'active',
         cancel_at_period_end = FALSE,
         end_date = CURRENT_DATE - 1
     WHERE id = $1`,
    [subscriptionId],
  );
  const adsBeforeF = await advertisementCountFor(subscriptionId);
  const f = await createAd(freelancerToken, { service_id: 1 });
  const usageF = await currentMonthUsage(freelancerId, subscriptionId);
  const adsAfterF = await advertisementCountFor(subscriptionId);
  const settled = await query(
    'SELECT status, cancel_at_period_end FROM subscriptions WHERE id = $1',
    [subscriptionId],
  );
  const historical = await requestJson(base, '/api/freelancers/me/advertisements', {
    token: freelancerToken,
  });
  assert(
    'F_expired_subscription',
    f.status === 403 &&
      f.json?.message === 'Forbidden: insufficient role' &&
      usageF?.ads_used === 2 &&
      adsAfterF === adsBeforeF &&
      historical.status === 200 &&
      historical.json.data.length >= 3,
    JSON.stringify({
      status: f.status,
      message: f.json?.message,
      settled: settled.rows[0],
      usageF,
      adsBeforeF,
      adsAfterF,
      historicalCount: historical.json?.data?.length,
    }),
  );

  await query(
    `UPDATE subscriptions
     SET status = 'active',
         cancel_at_period_end = FALSE,
         end_date = CURRENT_DATE + 30
     WHERE id = $1`,
    [subscriptionId],
  );

  await query(
    `UPDATE subscription_ad_usage
     SET ads_used = 1
     WHERE freelancer_id = $1
       AND subscription_id = $2
       AND period_start = date_trunc('month', CURRENT_DATE)::date`,
    [freelancerId, subscriptionId],
  );
  const usageBeforeL = await currentMonthUsage(freelancerId, subscriptionId);
  const adsBeforeL = await advertisementCountFor(subscriptionId);
  let lFailed = false;
  try {
    await withTransaction(async (client) => {
      const reserved = await incrementMonthlyAdUsage(
        { freelancerId, subscriptionId },
        client,
      );
      if (!reserved) {
        throw new Error('quota already full before rollback probe');
      }
      await insertAdvertisement(
        {
          freelancerId,
          serviceId: 999999,
          subscriptionId,
        },
        client,
      );
    });
  } catch {
    lFailed = true;
  }
  const usageAfterL = await currentMonthUsage(freelancerId, subscriptionId);
  const adsAfterL = await advertisementCountFor(subscriptionId);
  assert(
    'L_atomic_rollback',
    lFailed &&
      usageAfterL?.ads_used === usageBeforeL?.ads_used &&
      adsAfterL === adsBeforeL,
    JSON.stringify({
      lFailed,
      usageBeforeL,
      usageAfterL,
      adsBeforeL,
      adsAfterL,
    }),
  );

  await query(
    `DELETE FROM subscription_ad_usage
     WHERE freelancer_id = $1
       AND subscription_id = $2
       AND period_start = date_trunc('month', CURRENT_DATE)::date`,
    [freelancerId, subscriptionId],
  );
  const adsBeforeM = await advertisementCountFor(subscriptionId);
  const concurrent = await Promise.all([
    createAd(freelancerToken, { service_id: 1 }),
    createAd(freelancerToken, { service_id: 1 }),
    createAd(freelancerToken, { service_id: 1 }),
  ]);
  concurrent.forEach((item) => {
    if (item.json?.data?.id) createdAdIds.push(item.json.data.id);
  });
  const createdM = concurrent.filter((item) => item.status === 201);
  const blockedM = concurrent.filter((item) => item.status === 409);
  const usageM = await currentMonthUsage(freelancerId, subscriptionId);
  if (usageM?.id) createdUsageIds.push(usageM.id);
  const adsAfterM = await advertisementCountFor(subscriptionId);
  assert(
    'M_concurrent_limit',
    createdM.length === 2 &&
      blockedM.length === 1 &&
      usageM?.ads_used === 2 &&
      adsAfterM === adsBeforeM + 2,
    JSON.stringify({
      statuses: concurrent.map((item) => item.status),
      created: createdM.length,
      blocked: blockedM.length,
      usageM,
      adsBeforeM,
      adsAfterM,
    }),
  );

  const walletAfter = await query(
    'SELECT id, user_id, balance, escrow_balance FROM wallets ORDER BY id',
  );
  const transactionsAfter = await query(
    'SELECT id, wallet_id, contract_id, type, commission, amount FROM transactions ORDER BY id',
  );
  assert(
    'wallet_unchanged',
    JSON.stringify(walletBefore.rows) === JSON.stringify(walletAfter.rows),
  );
  assert(
    'transactions_unchanged',
    JSON.stringify(transactionsBefore.rows) ===
      JSON.stringify(transactionsAfter.rows),
  );

  if (createdAdIds.length) {
    await query('DELETE FROM advertisements WHERE id = ANY($1::int[])', [
      createdAdIds,
    ]);
  }
  await query(
    'DELETE FROM subscription_ad_usage WHERE subscription_id = $1',
    [subscriptionId],
  );
  await query('DELETE FROM subscriptions WHERE id = $1', [subscriptionId]);
  if (createdServiceIds.length) {
    await query('DELETE FROM services WHERE id = ANY($1::int[])', [
      createdServiceIds,
    ]);
  }

  const afterCounts = await countTables();
  console.log('AFTER_COUNTS', JSON.stringify(afterCounts));
  assert(
    'row_counts_restored',
    JSON.stringify(beforeCounts) === JSON.stringify(afterCounts),
    JSON.stringify({ beforeCounts, afterCounts }),
  );
} catch (error) {
  record('test_runner', false, error.stack || error.message);
} finally {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    if (createdAdIds.length) {
      await query('DELETE FROM advertisements WHERE id = ANY($1::int[])', [
        createdAdIds,
      ]);
    }
    if (createdSubscriptionIds.length) {
      await query(
        'DELETE FROM subscription_ad_usage WHERE subscription_id = ANY($1::int[])',
        [createdSubscriptionIds],
      );
      await query('DELETE FROM subscriptions WHERE id = ANY($1::int[])', [
        createdSubscriptionIds,
      ]);
    }
    if (createdServiceIds.length) {
      await query('DELETE FROM services WHERE id = ANY($1::int[])', [
        createdServiceIds,
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
