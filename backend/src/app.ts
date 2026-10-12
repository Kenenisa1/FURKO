import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRouter from './routes';
import healthRoutes from './routes/health.routes';
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

  // 5. Static File Serving for Evidence & Attachments
  app.use('/uploads', express.static(env.uploads.directory));

  // 6. Root Health Check (Direct)
  app.use('/health', healthRoutes);

  // 7. Base API v1 Routes
  app.use(env.apiPrefix, apiRouter);

  // 7. Welcome Route
  app.get('/', (_req, res) => {
    res.json({
      name: 'FURKO Backend API',
      description: 'CivicTech & Direct Service Routing Platform for Jimma City',
      version: '1.0.0',
      apiBase: env.apiPrefix,
      healthCheck: `${env.apiPrefix}/health`,
    });
  });

  // 8. 404 Handler
  app.use(notFoundHandler);

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp();
