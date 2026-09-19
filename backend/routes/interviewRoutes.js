import express from 'express';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewById
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.post('/start', aiLimiter, startInterview);
router.post('/:id/answer', aiLimiter, submitAnswer);
router.post('/:id/complete', completeInterview);
router.get('/history', getInterviewHistory);
router.get('/:id', getInterviewById);

export default router;
