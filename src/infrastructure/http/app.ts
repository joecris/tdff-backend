import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Container } from '@infrastructure/config/di-container';
import { requestLogger } from './middlewares/request-logger.middleware';
import { authenticate } from './middlewares/authenticate.middleware';
import { errorHandler } from './middlewares/error-handler.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { createApiRouter } from './routes';

export function createApp(container: Container): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(rateLimit({ windowMs: 60_000, limit: 100 }));
  app.use(requestLogger);
  app.use(express.json());
  // Attaches req.auth; never blocks by itself — only requireRole(...) on
  // specific admin routes actually rejects a request. See auth-verifier.port.ts.
  app.use(authenticate(container.authVerifier));

  app.use('/api', createApiRouter(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
