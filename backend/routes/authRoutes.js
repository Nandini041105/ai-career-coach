import express from 'express';
import { register, login, getProfile, updateRole } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getProfile);
router.put('/role', protect, updateRole);

export default router;
