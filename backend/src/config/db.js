import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const getPoolConfig = () => {
  if (env.databaseUrl) {
    return {
      connectionString: env.databaseUrl,
    };
  }

  return {
    host: env.pg.host,
    port: env.pg.port,
    user: env.pg.user,
    password: env.pg.password,
    database: env.pg.database,
  };
};

export const pool = new Pool(getPoolConfig());

export const query = (text, params = []) => {
  return pool.query(text, params);
};

export const checkConnection = async () => {
  const result = await query('SELECT 1 AS ok');
  return result.rows[0];
};

export const withTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original error if rollback also fails.
    }

    throw error;
  } finally {
    client.release();
  }
};
