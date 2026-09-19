import express from 'express';
import {
  uploadResumeDoc,
  getResumes,
  getResumeById,
  deleteResume
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', uploadResume, uploadResumeDoc);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

export default router;
