import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// Security Header Setup
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const sanitizeOrigin = (url?: string) => {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.origin;
  } catch (e) {
    return url.split('/')[0];
  }
};

const configuredFrontend = sanitizeOrigin(env.FRONTEND_URL);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = sanitizeOrigin(origin);

      if (
        cleanOrigin === configuredFrontend ||
        cleanOrigin === 'https://upfiles.vercel.app' ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Link-Password'],
  })
);

// Logging & Rate Limiting
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(globalLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'clouddrive-api', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'clouddrive-api', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Central Error Handler
app.use(errorHandler);

export default app;
