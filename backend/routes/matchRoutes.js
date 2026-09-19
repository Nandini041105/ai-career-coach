import express from 'express';
import {
  matchResumeToJob,
  getMatches,
  getMatchById
} from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.post('/', aiLimiter, matchResumeToJob);
router.get('/', getMatches);
router.get('/:id', getMatchById);

export default router;
