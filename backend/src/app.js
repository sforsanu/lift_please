import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import ridesRouter from './routes/rides.routes.js';
import statsRouter from './routes/stats.routes.js';
import deliveryRouter from './routes/delivery.routes.js';
import freelancerRouter from './routes/freelancer.routes.js';
import notificationRouter from './routes/notification.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  const isDev = process.env.NODE_ENV !== 'production';
  const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim());

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (configuredOrigins.includes(origin)) return callback(null, true);
        if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS not allowed for origin: ' + origin));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/rides', ridesRouter);
  app.use('/api/carbon-stats', statsRouter);
  app.use('/api/deliveries', deliveryRouter);
  app.use('/api/freelancers', freelancerRouter);
  app.use('/api/notifications', notificationRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
