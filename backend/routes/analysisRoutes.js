import express from 'express';
import {
  analyzeResumeDoc,
  getLatestAnalysis,
  getAnalysisByResumeId
} from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.post('/', aiLimiter, analyzeResumeDoc);
router.get('/latest', getLatestAnalysis);
router.get('/:resumeId', getAnalysisByResumeId);

export default router;
