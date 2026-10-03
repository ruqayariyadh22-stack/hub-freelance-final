import { pool, query } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const usage = () => {
  console.log('Usage: npm run create-admin -- <email> <password> [name]');
  console.log('Example: npm run create-admin -- admin@hub.com StrongPass123 "Hub Admin"');
};

const createAdmin = async () => {
  const [rawEmail, password, ...nameParts] = process.argv.slice(2);
  const email = (rawEmail || '').trim().toLowerCase();
  const name = nameParts.join(' ').trim() || 'Admin';

  if (!EMAIL_PATTERN.test(email) || !password) {
    usage();
    process.exitCode = 1;
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);
  const existing = await query('SELECT id, role FROM users WHERE email = $1', [email]);

  if (existing.rows[0]) {
    await query(
      `UPDATE users
       SET role = 'admin', password_hash = $1, account_status = 'active'
       WHERE id = $2`,
      [passwordHash, existing.rows[0].id],
    );
    console.log(`Existing user ${email} is now an admin (password updated).`);
    return;
  }

  await query(
    `INSERT INTO users (name, email, password_hash, role, account_status, created_at)
     VALUES ($1, $2, $3, 'admin', 'active', CURRENT_TIMESTAMP)`,
    [name, email, passwordHash],
  );
  console.log(`Admin ${email} created.`);
};

createAdmin()
  .catch((error) => {
    console.error('Failed to create admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
