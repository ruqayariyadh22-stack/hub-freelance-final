import app from '../../../app.js';
import { pool, query } from '../../../config/db.js';
import { signAccessToken } from '../../../utils/jwt.js';

const results = [];
const createdProjectIds = [];
const createdProposalIds = [];
const createdContractIds = [];
const createdTransactionIds = [];
const createdSubscriptionIds = [];

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
    'proposals',
    'contracts',
  ];
  const counts = {};
  for (const table of tables) {
    const result = await query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    counts[table] = result.rows[0].n;
  }
  return counts;
};

const snapshotBusiness = async () => {
  const [projects, proposals, contracts, transactions, wallets, services, ads] =
    await Promise.all([
      query(
        'SELECT id, client_id, status, chosen_freelancer_id FROM projects ORDER BY id',
      ),
      query(
        'SELECT id, project_id, freelancer_id, status FROM proposals ORDER BY id',
      ),
      query(
        'SELECT id, project_id, client_id, freelancer_id, contract_value, commission, status, payment_status FROM contracts ORDER BY id',
      ),
      query(
        'SELECT id, wallet_id, contract_id, type, commission, amount FROM transactions ORDER BY id',
      ),
      query(
        'SELECT id, user_id, balance, escrow_balance FROM wallets ORDER BY id',
      ),
      query(
        'SELECT id, freelancer_id, title, is_featured FROM services ORDER BY id',
      ),
      query('SELECT id, freelancer_id, service_id FROM advertisements ORDER BY id'),
    ]);

  return JSON.stringify({
    projects: projects.rows,
    proposals: proposals.rows,
    contracts: contracts.rows,
    transactions: transactions.rows,
    wallets: wallets.rows,
    services: services.rows,
    advertisements: ads.rows,
  });
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

let server;

try {
  const beforeCounts = await countTables();
  const beforeSnapshot = await snapshotBusiness();
  console.log('BEFORE_COUNTS', JSON.stringify(beforeCounts));

  const users = await query(
    `SELECT u.id, u.email, u.role, fp.id AS freelancer_id
     FROM users u
     LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
     WHERE u.id IN (3, 4, 5)
     ORDER BY u.id`,
  );
  const userById = Object.fromEntries(users.rows.map((row) => [row.id, row]));
  const freelancerA = userById[5];
  const freelancerB = userById[3];
  const clientUser = userById[4];
  const freelancerAId = freelancerA.freelancer_id;
  const freelancerBId = freelancerB.freelancer_id;

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const tokenA = signAccessToken({
    sub: freelancerA.id,
    email: freelancerA.email,
    role: 'freelancer',
  });
  const tokenB = signAccessToken({
    sub: freelancerB.id,
    email: freelancerB.email,
    role: 'freelancer',
  });
  const clientToken = signAccessToken({
    sub: clientUser.id,
    email: clientUser.email,
    role: 'client',
  });

  const getStats = (token, path = '/api/freelancers/me/statistics') =>
    requestJson(base, path, { token });

  const m = await requestJson(base, '/api/freelancers/me/statistics');
  assert(
    'M_unauthenticated',
    m.status === 401 && m.json?.message === 'Authentication required',
    JSON.stringify({ status: m.status, message: m.json?.message }),
  );

  const l = await getStats(clientToken);
  assert(
    'L_client_rejected',
    l.status === 403 && l.json?.message === 'Forbidden: insufficient role',
    JSON.stringify({ status: l.status, message: l.json?.message }),
  );

  const b = await getStats(tokenA);
  assert(
    'B_no_subscription',
    b.status === 403 && b.json?.message === 'Forbidden: insufficient role',
    JSON.stringify({ status: b.status, message: b.json?.message }),
  );

  const subA = await query(
    `INSERT INTO subscriptions (
       freelancer_id, plan_type, price, start_date, end_date,
       status, payment_status, cancel_at_period_end
     )
     VALUES ($1, 'Freelancer Pro', 25000, CURRENT_DATE, CURRENT_DATE + 30,
             'active', 'paid', FALSE)
     RETURNING id`,
    [freelancerAId],
  );
  createdSubscriptionIds.push(subA.rows[0].id);

  const f = await getStats(tokenA);
  assert(
    'F_zero_proposals',
    f.status === 200 &&
      f.json?.data?.total_proposals === 0 &&
      f.json?.data?.accepted_proposals === 0 &&
      f.json?.data?.proposal_acceptance_rate === 0 &&
      f.json.data.total_projects === 0 &&
      f.json.data.completed_projects === 0 &&
      f.json.data.active_projects === 0 &&
      f.json.data.total_contracts === 0 &&
      f.json.data.total_earnings === 0,
    JSON.stringify(f.json),
  );

  const completedProject = await query(
    `INSERT INTO projects (
       client_id, title, description, category, status, chosen_freelancer_id
     )
     VALUES (3, '4C completed', 'temp', 'web', 'completed', $1)
     RETURNING id`,
    [freelancerAId],
  );
  createdProjectIds.push(completedProject.rows[0].id);

  const activeProject = await query(
    `INSERT INTO projects (
       client_id, title, description, category, status, chosen_freelancer_id
     )
     VALUES (3, '4C active', 'temp', 'web', 'in_progress', $1)
     RETURNING id`,
    [freelancerAId],
  );
  createdProjectIds.push(activeProject.rows[0].id);

  const openProject = await query(
    `INSERT INTO projects (
       client_id, title, description, category, status, chosen_freelancer_id
     )
     VALUES (3, '4C open unchosen', 'temp', 'web', 'open', NULL)
     RETURNING id`,
  );
  createdProjectIds.push(openProject.rows[0].id);

  const acceptedProposal = await query(
    `INSERT INTO proposals (
       project_id, freelancer_id, proposed_price, proposed_duration, message, status
     )
     VALUES ($1, $2, 200, 7, 'accepted temp', 'accepted')
     RETURNING id`,
    [completedProject.rows[0].id, freelancerAId],
  );
  createdProposalIds.push(acceptedProposal.rows[0].id);

  const rejectedProposal = await query(
    `INSERT INTO proposals (
       project_id, freelancer_id, proposed_price, proposed_duration, message, status
     )
     VALUES ($1, $2, 180, 8, 'rejected temp', 'rejected')
     RETURNING id`,
    [openProject.rows[0].id, freelancerAId],
  );
  createdProposalIds.push(rejectedProposal.rows[0].id);

  const pendingOne = await query(
    `INSERT INTO proposals (
       project_id, freelancer_id, proposed_price, proposed_duration, message, status
     )
     VALUES ($1, $2, 170, 9, 'pending one', 'pending')
     RETURNING id`,
    [openProject.rows[0].id, freelancerAId],
  );
  createdProposalIds.push(pendingOne.rows[0].id);

  const pendingTwo = await query(
    `INSERT INTO proposals (
       project_id, freelancer_id, proposed_price, proposed_duration, message, status
     )
     VALUES ($1, $2, 160, 10, 'pending two', 'pending')
     RETURNING id`,
    [openProject.rows[0].id, freelancerAId],
  );
  createdProposalIds.push(pendingTwo.rows[0].id);

  const contractA = await query(
    `INSERT INTO contracts (
       project_id, client_id, freelancer_id, contract_value, commission,
       status, start_date, payment_status
     )
     VALUES ($1, 3, $2, 200, NULL, 'in_progress', CURRENT_DATE, 'released')
     RETURNING id`,
    [activeProject.rows[0].id, freelancerAId],
  );
  createdContractIds.push(contractA.rows[0].id);

  const releaseTx = await query(
    `INSERT INTO transactions (
       wallet_id, contract_id, type, commission, amount
     )
     VALUES (2, $1, 'release', 10, 200)
     RETURNING id`,
    [contractA.rows[0].id],
  );
  createdTransactionIds.push(releaseTx.rows[0].id);

  const ignoredEscrow = await query(
    `INSERT INTO transactions (
       wallet_id, contract_id, type, commission, amount
     )
     VALUES (2, $1, 'escrow', NULL, 200)
     RETURNING id`,
    [contractA.rows[0].id],
  );
  createdTransactionIds.push(ignoredEscrow.rows[0].id);

  const ignoredDeposit = await query(
    `INSERT INTO transactions (
       wallet_id, contract_id, type, commission, amount
     )
     VALUES (5, NULL, 'deposit', NULL, 999)
     RETURNING id`,
  );
  createdTransactionIds.push(ignoredDeposit.rows[0].id);

  const expectedA = {
    total_projects: 2,
    completed_projects: 1,
    active_projects: 1,
    total_proposals: 4,
    accepted_proposals: 1,
    proposal_acceptance_rate: 25,
    total_contracts: 1,
    total_earnings: 190,
  };

  const beforeGetCounts = await countTables();
  const beforeGetSnapshot = await snapshotBusiness();
  const a = await getStats(tokenA);
  const afterGetCounts = await countTables();
  const afterGetSnapshot = await snapshotBusiness();

  assert(
    'A_active_pro_access',
    a.status === 200 &&
      JSON.stringify(a.json?.data) === JSON.stringify(expectedA),
    JSON.stringify({ status: a.status, data: a.json?.data, expectedA }),
  );

  const override = await getStats(
    tokenA,
    '/api/freelancers/me/statistics?freelancer_id=1',
  );
  assert(
    'query_param_cannot_override_owner',
    override.status === 200 &&
      JSON.stringify(override.json?.data) === JSON.stringify(expectedA),
    JSON.stringify(override.json),
  );

  assert(
    'G_proposal_acceptance_rate',
    a.json?.data?.total_proposals === 4 &&
      a.json?.data?.accepted_proposals === 1 &&
      a.json?.data?.proposal_acceptance_rate === 25,
    JSON.stringify(a.json?.data),
  );

  assert(
    'H_project_counts',
    a.json?.data?.total_projects === 2 &&
      a.json?.data?.completed_projects === 1 &&
      a.json?.data?.active_projects === 1,
    JSON.stringify(a.json?.data),
  );

  assert(
    'I_contract_count',
    a.json?.data?.total_contracts === 1,
    JSON.stringify(a.json?.data),
  );

  assert(
    'J_earnings_release_payout_only',
    a.json?.data?.total_earnings === 190,
    JSON.stringify(a.json?.data),
  );

  assert(
    'N_no_mutation_on_get',
    JSON.stringify(beforeGetCounts) === JSON.stringify(afterGetCounts) &&
      beforeGetSnapshot === afterGetSnapshot,
    JSON.stringify({ beforeGetCounts, afterGetCounts }),
  );

  const subB = await query(
    `INSERT INTO subscriptions (
       freelancer_id, plan_type, price, start_date, end_date,
       status, payment_status, cancel_at_period_end
     )
     VALUES ($1, 'Freelancer Pro', 25000, CURRENT_DATE, CURRENT_DATE + 30,
             'active', 'paid', FALSE)
     RETURNING id`,
    [freelancerBId],
  );
  createdSubscriptionIds.push(subB.rows[0].id);

  const statsB = await getStats(tokenB);
  const expectedB = {
    total_projects: 1,
    completed_projects: 0,
    active_projects: 1,
    total_proposals: 1,
    accepted_proposals: 1,
    proposal_acceptance_rate: 100,
    total_contracts: 1,
    total_earnings: 0,
  };
  assert(
    'K_ownership_isolation',
    statsB.status === 200 &&
      JSON.stringify(statsB.json?.data) === JSON.stringify(expectedB) &&
      JSON.stringify(statsB.json.data) !== JSON.stringify(a.json.data),
    JSON.stringify({ a: a.json?.data, b: statsB.json?.data }),
  );

  await query(
    `UPDATE subscriptions
     SET cancel_at_period_end = TRUE
     WHERE id = $1`,
    [subA.rows[0].id],
  );
  const e = await getStats(tokenA);
  assert(
    'E_cancel_at_period_end_still_active',
    e.status === 200 &&
      JSON.stringify(e.json?.data) === JSON.stringify(expectedA),
    JSON.stringify({ status: e.status, data: e.json?.data }),
  );

  await query(
    `UPDATE subscriptions
     SET status = 'cancelled'
     WHERE id = $1`,
    [subA.rows[0].id],
  );
  const d = await getStats(tokenA);
  assert(
    'D_cancelled_subscription',
    d.status === 403 && d.json?.message === 'Forbidden: insufficient role',
    JSON.stringify({ status: d.status, message: d.json?.message }),
  );

  await query(
    `UPDATE subscriptions
     SET status = 'active',
         cancel_at_period_end = FALSE,
         end_date = CURRENT_DATE - 1
     WHERE id = $1`,
    [subA.rows[0].id],
  );
  const c = await getStats(tokenA);
  const settled = await query(
    'SELECT status FROM subscriptions WHERE id = $1',
    [subA.rows[0].id],
  );
  assert(
    'C_expired_subscription',
    c.status === 403 &&
      c.json?.message === 'Forbidden: insufficient role' &&
      settled.rows[0]?.status === 'expired',
    JSON.stringify({
      status: c.status,
      message: c.json?.message,
      settled: settled.rows[0],
    }),
  );

  if (createdTransactionIds.length) {
    await query('DELETE FROM transactions WHERE id = ANY($1::int[])', [
      createdTransactionIds,
    ]);
  }
  if (createdContractIds.length) {
    await query('DELETE FROM contracts WHERE id = ANY($1::int[])', [
      createdContractIds,
    ]);
  }
  if (createdProposalIds.length) {
    await query('DELETE FROM proposals WHERE id = ANY($1::int[])', [
      createdProposalIds,
    ]);
  }
  if (createdProjectIds.length) {
    await query('DELETE FROM projects WHERE id = ANY($1::int[])', [
      createdProjectIds,
    ]);
  }
  if (createdSubscriptionIds.length) {
    await query('DELETE FROM subscriptions WHERE id = ANY($1::int[])', [
      createdSubscriptionIds,
    ]);
  }

  const afterCounts = await countTables();
  const afterSnapshot = await snapshotBusiness();
  console.log('AFTER_COUNTS', JSON.stringify(afterCounts));
  assert(
    'O_existing_data_integrity',
    JSON.stringify(beforeCounts) === JSON.stringify(afterCounts) &&
      beforeSnapshot === afterSnapshot,
    JSON.stringify({ beforeCounts, afterCounts }),
  );
} catch (error) {
  record('test_runner', false, error.stack || error.message);
} finally {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    if (createdTransactionIds.length) {
      await query('DELETE FROM transactions WHERE id = ANY($1::int[])', [
        createdTransactionIds,
      ]);
    }
    if (createdContractIds.length) {
      await query('DELETE FROM contracts WHERE id = ANY($1::int[])', [
        createdContractIds,
      ]);
    }
    if (createdProposalIds.length) {
      await query('DELETE FROM proposals WHERE id = ANY($1::int[])', [
        createdProposalIds,
      ]);
    }
    if (createdProjectIds.length) {
      await query('DELETE FROM projects WHERE id = ANY($1::int[])', [
        createdProjectIds,
      ]);
    }
    if (createdSubscriptionIds.length) {
      await query('DELETE FROM subscriptions WHERE id = ANY($1::int[])', [
        createdSubscriptionIds,
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
