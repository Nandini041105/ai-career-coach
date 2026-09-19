import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import skillGapRoutes from './routes/skillGapRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      // or match any local development origin
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://10.') || origin.startsWith('http://192.168.') || origin.startsWith('exp://')) {
        return callback(null, true);
      }
      callback(null, true); // Allow all in development/testing
    },
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI-Powered Career Coach API',
    aiStatus: process.env.GEMINI_API_KEY ? 'gemini-configured' : 'heuristic-fallback'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/skills', skillGapRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] AI Career Coach Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Mobile LAN access: http://10.178.125.122:${PORT}/api`);
    });
  } catch (error) {
    console.error(`[Server] Failed to initialize server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
