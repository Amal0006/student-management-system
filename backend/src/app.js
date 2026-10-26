import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import studentsRouter from './routes/students.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();

// Read the permitted frontend origins from the backend environment.
const configuredOrigins = (
  process.env.CLIENT_ORIGIN || 'http://localhost:5174'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Allow both common Vite development ports during local development.
// In production, only the explicitly configured frontend origins are allowed.
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : [
        ...new Set([
          ...configuredOrigins,
          'http://localhost:5173',
          'http://localhost:5174',
        ]),
      ];

app.disable('x-powered-by');
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin is not allowed by CORS.'));
    },
  })
);

app.use(express.json({ limit: '100kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

// Apply the general API rate limit.
app.use('/api', apiLimiter);

// Authentication routes.
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: req.app.locals.databaseReady
      ? 'connected'
      : 'disconnected',
  });
});

// Authenticate first, then check database availability.
app.use(
  '/api/students',
  requireAuth,
  (req, res, next) => {
    if (!req.app.locals.databaseReady) {
      return res.status(503).json({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message:
            'The database is not connected. Check the API server configuration and try again.',
        },
      });
    }

    next();
  },
  studentsRouter
);

app.use(notFound);
app.use(errorHandler);

export default app;