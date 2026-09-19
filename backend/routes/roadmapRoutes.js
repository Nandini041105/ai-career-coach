import express from 'express';
import { createRoadmap, getLatestRoadmap } from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.post('/generate', aiLimiter, createRoadmap);
router.get('/latest', getLatestRoadmap);

export default router;
