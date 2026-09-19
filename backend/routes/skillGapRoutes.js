import express from 'express';
import {
  getLatestSkillGaps,
  getSkillGapById
} from '../controllers/skillGapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/latest', getLatestSkillGaps);
router.get('/:id', getSkillGapById);

export default router;
