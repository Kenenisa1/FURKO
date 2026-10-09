import app from './app';
import { env } from './config/env';
import { pool } from './config/db';

const server = app.listen(env.port, () => {
  console.log('====================================================');
  console.log(`🚀 FURKO API Server listening on port: ${env.port}`);
  console.log(`📡 Environment: ${env.nodeEnv}`);
  console.log(`🔗 Base API URL: http://localhost:${env.port}${env.apiPrefix}`);
  console.log(`🩺 Healthcheck: http://localhost:${env.port}${env.apiPrefix}/health`);
  console.log('====================================================');
});

// Graceful shutdown handling
const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await pool.end();
      console.log('[DB] PostgreSQL pool closed.');
    } catch (err) {
      console.error('[DB] Error while closing PostgreSQL pool:', err);
    }
    process.exit(0);
  });

  // Force close after 10s if connections linger
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export default server;
