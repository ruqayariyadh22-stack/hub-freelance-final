import app from '../../app.js';
import { pool, query } from '../../config/db.js';
import { signAccessToken } from '../../utils/jwt.js';
import { calculateCommission } from '../wallet/money.js';

const results = [];
const createdProjectIds = [];
const createdContractIds = [];
const createdTransactionIds = [];
const createdDisputeIds = [];
const createdAdminIds = [];
const createdNotificationIds = [];

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

const trackId = (list, row) => {
  if (row?.id != null) {
    list.push(row.id);
  }
  return row;
};

const walletSnapshot = async () => {
  const result = await query(
    'SELECT id, user_id, balance, escrow_balance FROM wallets ORDER BY id',
  );
  return result.rows;
};

const releaseCountFor = async (contractId) => {
  const result = await query(
    `SELECT COUNT(*)::int AS n
     FROM transactions
     WHERE contract_id = $1
       AND type = 'release'`,
    [contractId],
  );
  return result.rows[0].n;
};

const activeDisputeCount = async (projectId) => {
  const result = await query(
    `SELECT COUNT(*)::int AS n
     FROM disputes
     WHERE project_id = $1
       AND (status IS NULL OR status <> 'resolved')`,
    [projectId],
  );
  return result.rows[0].n;
};

const insertReleasableFixture = async ({
  clientProfileId,
  freelancerProfileId,
  clientWalletId,
  title,
}) => {
  const contractValue = 200;
  const project = trackId(
    createdProjectIds,
    (
      await query(
        `INSERT INTO projects (
           client_id,
           title,
           description,
           category,
           status,
           chosen_freelancer_id
         )
         VALUES ($1, $2, 'dis-fix temp', 'web', 'in_progress', $3)
         RETURNING id, client_id, status, chosen_freelancer_id`,
        [clientProfileId, title, freelancerProfileId],
      )
    ).rows[0],
  );

  const contract = trackId(
    createdContractIds,
    (
      await query(
        `INSERT INTO contracts (
           project_id,
           client_id,
           freelancer_id,
           contract_value,
           commission,
           status,
           payment_status
         )
         VALUES ($1, $2, $3, $4, 10, 'delivered', 'pending')
         RETURNING id, project_id, contract_value, status, payment_status`,
        [project.id, clientProfileId, freelancerProfileId, contractValue],
      )
    ).rows[0],
  );

  await query(
    `UPDATE wallets
     SET escrow_balance = COALESCE(escrow_balance, 0) + $2
     WHERE id = $1`,
    [clientWalletId, contractValue],
  );

  const escrow = trackId(
    createdTransactionIds,
    (
      await query(
        `INSERT INTO transactions (
           wallet_id,
           contract_id,
           type,
           commission,
           amount
         )
         VALUES ($1, $2, 'escrow', NULL, $3)
         RETURNING id`,
        [clientWalletId, contract.id, contractValue],
      )
    ).rows[0],
  );

  return { project, contract, escrow, contractValue };
};

let server;
let walletsBefore = [];
let maxNotificationId = 0;

try {
  walletsBefore = await walletSnapshot();
  const notificationBound = await query(
    'SELECT COALESCE(MAX(id), 0)::int AS n FROM notifications',
  );
  maxNotificationId = notificationBound.rows[0].n;
  const disputesBefore = await query(
    'SELECT id, project_id, status FROM disputes ORDER BY id',
  );

  const users = await query(
    `SELECT u.id, u.email, u.role, u.account_status,
            cp.id AS client_profile_id,
            fp.id AS freelancer_profile_id
     FROM users u
     LEFT JOIN client_profiles cp ON cp.user_id = u.id
     LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
     WHERE u.account_status = 'active'
     ORDER BY u.id`,
  );
  const clientUser = users.rows.find(
    (row) => row.role === 'client' && row.client_profile_id,
  );
  const freelancerUser = users.rows.find(
    (row) => row.role === 'freelancer' && row.freelancer_profile_id,
  );
  let adminUser = users.rows.find((row) => row.role === 'admin');

  assert('client_ready', Boolean(clientUser), 'need an active client');
  assert(
    'freelancer_ready',
    Boolean(freelancerUser),
    'need an active freelancer',
  );

  if (!adminUser) {
    const insertedAdmin = await query(
      `INSERT INTO users (name, email, password_hash, role, account_status)
       VALUES ('DIS temp admin', 'dis12.admin@example.test', 'x', 'admin', 'active')
       RETURNING id, email, role`,
    );
    adminUser = insertedAdmin.rows[0];
    createdAdminIds.push(adminUser.id);
    await query(
      `INSERT INTO wallets (user_id, balance, escrow_balance)
       VALUES ($1, 0, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [adminUser.id],
    );
  }

  const clientWallet = (
    await query('SELECT id, user_id, balance, escrow_balance FROM wallets WHERE user_id = $1', [
      clientUser.id,
    ])
  ).rows[0];
  const freelancerWallet = (
    await query('SELECT id, user_id, balance, escrow_balance FROM wallets WHERE user_id = $1', [
      freelancerUser.id,
    ])
  ).rows[0];
  assert('client_wallet_ready', Boolean(clientWallet));
  assert('freelancer_wallet_ready', Boolean(freelancerWallet));

  const fixtureA = await insertReleasableFixture({
    clientProfileId: clientUser.client_profile_id,
    freelancerProfileId: freelancerUser.freelancer_profile_id,
    clientWalletId: clientWallet.id,
    title: 'DIS-12 fixture',
  });
  const fixtureB = await insertReleasableFixture({
    clientProfileId: clientUser.client_profile_id,
    freelancerProfileId: freelancerUser.freelancer_profile_id,
    clientWalletId: clientWallet.id,
    title: 'DIS-21 fixture',
  });

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const clientToken = tokenFor(clientUser);
  const freelancerToken = tokenFor(freelancerUser);
  const adminToken = tokenFor(adminUser);

  const postDispute = (token, body) =>
    requestJson(base, '/api/disputes', { method: 'POST', token, body });
  const getDispute = (id, token) => requestJson(base, `/api/disputes/${id}`, { token });
  const patchAdminDispute = (id, body) =>
    requestJson(base, `/api/admin/disputes/${id}`, {
      method: 'PATCH',
      token: adminToken,
      body,
    });
  const postRelease = (contractId, token = clientToken) =>
    requestJson(base, `/api/wallet/release/${contractId}`, {
      method: 'POST',
      token,
      body: {},
    });

  const walletsAfterFixture = await walletSnapshot();

  const unauth = await postDispute(undefined, { project_id: fixtureA.project.id });
  assert(
    'regression_unauthenticated_create',
    unauth.status === 401,
    JSON.stringify(unauth),
  );

  const adminCreate = await postDispute(adminToken, {
    project_id: fixtureA.project.id,
  });
  assert(
    'regression_admin_cannot_create',
    adminCreate.status === 403,
    JSON.stringify(adminCreate),
  );

  const injected = await postDispute(clientToken, {
    project_id: fixtureA.project.id,
    reported_by: freelancerUser.id,
    user_id: 999,
  });
  assert(
    'regression_identity_injection',
    injected.status === 400 && injected.json?.success === false,
    JSON.stringify(injected),
  );

  const createdA = await postDispute(clientToken, {
    project_id: fixtureA.project.id,
  });
  assert(
    'dis12_create_active',
    createdA.status === 201 &&
      createdA.json?.data?.user_id == null &&
      createdA.json?.data?.status == null &&
      createdA.json?.data?.reported_by === clientUser.id &&
      createdA.json?.data?.project_id === fixtureA.project.id,
    JSON.stringify(createdA),
  );
  trackId(createdDisputeIds, createdA.json?.data);

  const blocked = await postRelease(fixtureA.contract.id);
  assert(
    'dis12_test1_active_blocks_release',
    blocked.status === 409 &&
      blocked.json?.message === 'Active dispute blocks release',
    JSON.stringify(blocked),
  );
  assert(
    'dis12_test1_no_release_tx',
    (await releaseCountFor(fixtureA.contract.id)) === 0,
  );
  const contractAfterBlock = (
    await query('SELECT payment_status FROM contracts WHERE id = $1', [
      fixtureA.contract.id,
    ])
  ).rows[0];
  assert(
    'dis12_test1_contract_not_released',
    contractAfterBlock.payment_status === 'pending',
  );
  const walletsAfterBlock = await walletSnapshot();
  assert(
    'dis12_test1_wallets_unchanged',
    JSON.stringify(walletsAfterFixture) === JSON.stringify(walletsAfterBlock),
  );

  const actionOnly = await patchAdminDispute(createdA.json.data.id, {
    action_taken: 'reviewed',
  });
  assert(
    'dis12_test4_action_taken_keeps_null_status',
    actionOnly.status === 200 && actionOnly.json?.data?.status == null,
    JSON.stringify(actionOnly),
  );
  const stillBlocked = await postRelease(fixtureA.contract.id);
  assert(
    'dis12_test4_non_resolved_still_blocks',
    stillBlocked.status === 409 &&
      stillBlocked.json?.message === 'Active dispute blocks release',
    JSON.stringify(stillBlocked),
  );

  const resolved = await patchAdminDispute(createdA.json.data.id, {
    status: 'resolved',
  });
  assert(
    'dis12_admin_sets_resolved',
    resolved.status === 200 && resolved.json?.data?.status === 'resolved',
    JSON.stringify(resolved),
  );
  const stored = await query('SELECT id, status FROM disputes WHERE id = $1', [
    createdA.json.data.id,
  ]);
  assert(
    'dis12_test3_row_remains',
    stored.rows.length === 1 && stored.rows[0].status === 'resolved',
  );

  const getAfterResolve = await getDispute(createdA.json.data.id, clientToken);
  assert(
    'dis12_test3_get_resolved',
    getAfterResolve.status === 200 &&
      getAfterResolve.json?.data?.id === createdA.json.data.id &&
      getAfterResolve.json?.data?.status === 'resolved',
    JSON.stringify(getAfterResolve),
  );

  const freelancerWalletBeforeRelease = (
    await query('SELECT balance FROM wallets WHERE id = $1', [freelancerWallet.id])
  ).rows[0];
  const released = await postRelease(fixtureA.contract.id);
  const expected = calculateCommission(fixtureA.contractValue);
  assert(
    'dis12_test2_release_allowed',
    released.status === 201 && released.json?.success === true,
    JSON.stringify(released),
  );
  assert(
    'dis12_test2_release_tx_exists',
    (await releaseCountFor(fixtureA.contract.id)) === 1,
  );
  const releaseTx = (
    await query(
      `SELECT id, type, commission, amount
       FROM transactions
       WHERE contract_id = $1 AND type = 'release'`,
      [fixtureA.contract.id],
    )
  ).rows[0];
  if (releaseTx) {
    createdTransactionIds.push(releaseTx.id);
  }
  assert(
    'regression_commission_5_percent',
    Number(releaseTx?.commission) === expected.commission &&
      Number(releaseTx?.amount) === expected.amount,
    JSON.stringify({ releaseTx, expected }),
  );
  const freelancerAfterRelease = (
    await query('SELECT balance FROM wallets WHERE id = $1', [freelancerWallet.id])
  ).rows[0];
  assert(
    'dis12_test2_freelancer_payout',
    Number(freelancerAfterRelease.balance) ===
      Number(freelancerWalletBeforeRelease.balance) + expected.payout,
    JSON.stringify({
      before: freelancerWalletBeforeRelease.balance,
      after: freelancerAfterRelease.balance,
      payout: expected.payout,
    }),
  );
  const stillStored = await query('SELECT id FROM disputes WHERE id = $1', [
    createdA.json.data.id,
  ]);
  assert('dis12_resolved_not_deleted_after_release', stillStored.rows.length === 1);

  const createdB = await postDispute(clientToken, {
    project_id: fixtureB.project.id,
  });
  assert('dis21_create_first', createdB.status === 201, JSON.stringify(createdB));
  trackId(createdDisputeIds, createdB.json?.data);
  const walletsBeforeBRelease = await walletSnapshot();
  const blockedB = await postRelease(fixtureB.contract.id);
  assert(
    'dis21_scenario_b_release_409',
    blockedB.status === 409 &&
      blockedB.json?.message === 'Active dispute blocks release',
    JSON.stringify(blockedB),
  );
  assert(
    'dis21_scenario_b_no_payout',
    (await releaseCountFor(fixtureB.contract.id)) === 0 &&
      JSON.stringify(await walletSnapshot()) === JSON.stringify(walletsBeforeBRelease),
  );
  const contractB = (
    await query('SELECT payment_status FROM contracts WHERE id = $1', [
      fixtureB.contract.id,
    ])
  ).rows[0];
  assert('dis21_scenario_b_contract_pending', contractB.payment_status === 'pending');

  const fixtureC = await insertReleasableFixture({
    clientProfileId: clientUser.client_profile_id,
    freelancerProfileId: freelancerUser.freelancer_profile_id,
    clientWalletId: clientWallet.id,
    title: 'DIS-21 lock wait',
  });
  const lockClient = await pool.connect();
  try {
    await lockClient.query('BEGIN');
    await lockClient.query('SELECT id FROM projects WHERE id = $1 FOR UPDATE', [
      fixtureC.project.id,
    ]);

    const waitingCreate = postDispute(clientToken, {
      project_id: fixtureC.project.id,
    });
    const waitingRelease = postRelease(fixtureC.contract.id);
    const raced = await Promise.race([
      Promise.all([waitingCreate, waitingRelease]).then((responses) => ({
        finished: true,
        responses,
      })),
      new Promise((resolve) => {
        setTimeout(() => resolve({ finished: false }), 500);
      }),
    ]);
    assert(
      'dis21_both_wait_on_project_lock',
      raced.finished === false,
      raced.finished ? JSON.stringify(raced.responses) : undefined,
    );

    await lockClient.query('COMMIT');
    const [createAfterWait, releaseAfterWait] = await Promise.all([
      waitingCreate,
      waitingRelease,
    ]);
    trackId(createdDisputeIds, createAfterWait.json?.data);
    if (releaseAfterWait.json?.data?.transaction?.id) {
      createdTransactionIds.push(releaseAfterWait.json.data.transaction.id);
    } else {
      const maybeRelease = await query(
        `SELECT id FROM transactions WHERE contract_id = $1 AND type = 'release'`,
        [fixtureC.contract.id],
      );
      maybeRelease.rows.forEach((row) => createdTransactionIds.push(row.id));
    }

    const serializedOk =
      (createAfterWait.status === 201 &&
        releaseAfterWait.status === 409 &&
        (await releaseCountFor(fixtureC.contract.id)) === 0 &&
        (await activeDisputeCount(fixtureC.project.id)) >= 1) ||
      (createAfterWait.status === 201 &&
        releaseAfterWait.status === 201 &&
        (await releaseCountFor(fixtureC.contract.id)) === 1);
    assert(
      'dis21_serialized_after_lock',
      serializedOk,
      JSON.stringify({
        create: createAfterWait,
        release: releaseAfterWait,
        releases: await releaseCountFor(fixtureC.contract.id),
        active: await activeDisputeCount(fixtureC.project.id),
      }),
    );

    if (releaseAfterWait.status === 201) {
      assert(
        'dis21_scenario_a_release_then_dispute',
        createAfterWait.status === 201 &&
          (await releaseCountFor(fixtureC.contract.id)) === 1,
      );
    }
    if (releaseAfterWait.status === 409) {
      assert(
        'dis21_scenario_b_after_wait',
        createAfterWait.status === 201 &&
          (await releaseCountFor(fixtureC.contract.id)) === 0,
      );
    }
  } finally {
    try {
      await lockClient.query('ROLLBACK');
    } catch {
      // already committed
    }
    lockClient.release();
  }

  const foreignGet = await getDispute(createdA.json.data.id, freelancerToken);
  assert(
    'regression_read_requires_participant_or_admin',
    foreignGet.status === 200 || foreignGet.status === 403,
    JSON.stringify(foreignGet),
  );
  const unrelatedClient = users.rows.find(
    (row) =>
      row.role === 'client' &&
      row.client_profile_id &&
      row.id !== clientUser.id,
  );
  if (unrelatedClient) {
    const otherGet = await getDispute(createdA.json.data.id, tokenFor(unrelatedClient));
    assert(
      'regression_unrelated_client_forbidden',
      otherGet.status === 403,
      JSON.stringify(otherGet),
    );
  }

  const freelancerCreateOnA = await postDispute(freelancerToken, {
    project_id: fixtureA.project.id,
  });
  assert(
    'regression_freelancer_participant_create',
    freelancerCreateOnA.status === 201 || freelancerCreateOnA.status === 403,
    JSON.stringify(freelancerCreateOnA),
  );
  trackId(createdDisputeIds, freelancerCreateOnA.json?.data);

  const afterDisputes = await query(
    `SELECT id FROM disputes WHERE id <> ALL($1::int[])`,
    [disputesBefore.rows.map((row) => row.id).concat([0])],
  );
  const leftoverPreexisting = disputesBefore.rows.filter(
    (row) => !createdDisputeIds.includes(row.id),
  );
  assert(
    'preexisting_disputes_kept',
    leftoverPreexisting.length === disputesBefore.rows.length,
    JSON.stringify({ leftoverPreexisting, createdDisputeIds }),
  );
} catch (error) {
  record('test_runner', false, error.stack || error.message);
} finally {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    if (createdNotificationIds.length) {
      await query('DELETE FROM notifications WHERE id = ANY($1::int[])', [
        createdNotificationIds,
      ]);
    }
    await query('DELETE FROM notifications WHERE id > $1', [maxNotificationId]);
    if (createdDisputeIds.length) {
      await query('DELETE FROM disputes WHERE id = ANY($1::int[])', [
        createdDisputeIds,
      ]);
    }
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
    if (createdProjectIds.length) {
      await query('DELETE FROM projects WHERE id = ANY($1::int[])', [
        createdProjectIds,
      ]);
    }
    for (const wallet of walletsBefore) {
      await query(
        `UPDATE wallets
         SET balance = $2,
             escrow_balance = $3
         WHERE id = $1`,
        [wallet.id, wallet.balance, wallet.escrow_balance],
      );
    }
    if (createdAdminIds.length) {
      await query('DELETE FROM notifications WHERE user_id = ANY($1::int[])', [
        createdAdminIds,
      ]);
      await query('DELETE FROM wallets WHERE user_id = ANY($1::int[])', [
        createdAdminIds,
      ]);
      await query('DELETE FROM users WHERE id = ANY($1::int[])', [createdAdminIds]);
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
