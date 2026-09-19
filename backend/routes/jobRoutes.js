import express from 'express';
import {
  createJobDescription,
  getJobs,
  getJobById,
  deleteJob,
  getJobRecommendations
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.get('/recommendations', getJobRecommendations);
router.post('/', aiLimiter, createJobDescription);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.delete('/:id', deleteJob);

export default router;
