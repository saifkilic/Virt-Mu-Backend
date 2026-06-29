import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { globalLimiter } from './middlewares/rateLimiter';
import authRouter from './routes/authRouter';
import museumRouter from './routes/museumRouter';
import roomRouter from './routes/roomRouter';
import artifactRouter from './routes/artifactRouter';
import commentRouter from './routes/commentRouter';
import achievementRouter from "./routes/achievementRouter"
import favoriteRouter from './routes/favoriteRouter';
import { errorHandler } from './middlewares/error';
import { connectDB } from "./config/db";
const app: Application = express();



app.use(helmet());
app.use(compression());
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});
const productionOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...productionOrigins
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'CORS policy violation';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api', globalLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

app.use(mongoSanitize());
app.use(hpp());

app.use('/api/auth', authRouter);
app.use('/api/museums', museumRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/artifacts', artifactRouter);
app.use('/api/comments', commentRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/achievement', achievementRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

app.use(errorHandler);

export default app;
