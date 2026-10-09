import { pool } from '../config/db';
import { env } from '../config/env';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  services: {
    api: {
      status: 'up';
      memoryUsage: {
        rssMb: number;
        heapUsedMb: number;
      };
    };
    database: {
      status: 'connected' | 'disconnected';
      responseTimeMs?: number;
      error?: string;
    };
  };
}

export const checkSystemHealth = async (): Promise<HealthCheckResult> => {
  const mem = process.memoryUsage();
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';
  let dbResponseTimeMs: number | undefined;
  let dbError: string | undefined;

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      dbStatus = 'connected';
      dbResponseTimeMs = Date.now() - start;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    dbStatus = 'disconnected';
    dbError = err instanceof Error ? err.message : 'Database ping failed';
  }

  const isHealthy = dbStatus === 'connected';

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.nodeEnv,
    version: '1.0.0',
    services: {
      api: {
        status: 'up',
        memoryUsage: {
          rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
          heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        },
      },
      database: {
        status: dbStatus,
        ...(dbResponseTimeMs !== undefined ? { responseTimeMs: dbResponseTimeMs } : {}),
        ...(dbError ? { error: dbError } : {}),
      },
    },
  };
};
