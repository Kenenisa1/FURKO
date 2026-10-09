import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'furko_db',
    user: process.env.DB_USER || 'furko_user',
    password: process.env.DB_PASSWORD || 'furko_password',
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT_MS || '2000', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'furko_jwt_dev_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
