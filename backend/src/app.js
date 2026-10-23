import express from 'express';
import cors from 'cors';
import studentsRouter from './routes/students.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
app.disable('x-powered-by');
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
} }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: req.app.locals.databaseReady ? 'connected' : 'disconnected' }));
app.use('/api/students', (req, res, next) => {
  if (!req.app.locals.databaseReady) return res.status(503).json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'The database is not connected. Check the API server configuration and try again.' } });
  next();
}, studentsRouter);
app.use(notFound);
app.use(errorHandler);
export default app;
