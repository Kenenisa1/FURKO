require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'furko_db',
  user: process.env.DB_USER || 'furko_user',
  password: process.env.DB_PASSWORD || 'furko_password',
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT_MS, 10) || 2000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle database client', err);
});

module.exports = pool;