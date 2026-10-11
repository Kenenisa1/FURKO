import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRouter from './routes';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/authRoutes'; // 👈 Import auth routes
import userRoutes from './routes/userRoutes'; // 👈 Import user profile routes
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS Configuration
  const corsOptions: cors.CorsOptions = {
    origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
  app.use(cors(corsOptions));

  // 3. Request Logging
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
  }

  // 4. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Root Health Check (Direct)
  app.use('/health', healthRoutes);

  // 6. Base API v1 Routes
  app.use(env.apiPrefix, apiRouter);

  // 7. Authentication Routes -> Mounted at /api/v1/auth/register and /api/v1/auth/login
  app.use(`${env.apiPrefix}/auth`, authRoutes);

  // 8. User Profile Routes -> Mounted at /api/v1/users/me
  app.use(`${env.apiPrefix}/users`, userRoutes);

  // 9. Welcome Route
  app.get('/', (_req, res) => {
    res.json({
      name: 'FURKO Backend API',
      description: 'CivicTech & Direct Service Routing Platform for Jimma City',
      version: '1.0.0',
      apiBase: env.apiPrefix,
      healthCheck: `${env.apiPrefix}/health`,
    });
  });

  // 10. 404 Handler
  app.use(notFoundHandler);

  // 11. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp();