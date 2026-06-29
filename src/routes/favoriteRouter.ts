// src/routes/favoriteRouter.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  toggleFavorite,
  getUserFavorites,
  getFavoriteIds,
  removeFavorite,
  clearAllFavorites
} from '../controllers/favoriteController';

const router = Router();

/**
 * GET /api/favorites
 * Fetch all user favorites with full artifact details
 */
router.get('/', protect, getUserFavorites);

/**
 * GET /api/favorites/ids
 * Fetch only favorite artifact IDs (lightweight)
 */
router.get('/ids', protect, getFavoriteIds);

/**
 * POST /api/favorites/:artifactId
 * Toggle favorite status for an artifact
 */
router.post('/:artifactId', protect, toggleFavorite);

/**
 * DELETE /api/favorites/:artifactId
 * Remove a specific artifact from favorites
 */
router.delete('/:artifactId', protect, removeFavorite);

/**
 * DELETE /api/favorites
 * Clear all favorites for the user
 */
router.delete('/', protect, clearAllFavorites);

export default router;