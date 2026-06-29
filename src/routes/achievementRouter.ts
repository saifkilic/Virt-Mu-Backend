// src/routes/achievementRouter.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getUserAchievements,
  getAchievementDefinitions,
} from '../controllers/achievementController';

const router = Router();

/**
 * GET /api/achievements
 * Fetch all user achievements (private)
 */
router.get('/', protect, getUserAchievements);

/**
 * GET /api/achievements/definitions
 * Fetch achievement definitions for progress tracking (public)
 */
router.get('/definitions', getAchievementDefinitions);

export default router;