// src/controllers/favoriteController.ts
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Artifact } from '../models/Artifact';
import { sendResponse as sendSuccess, sendError } from '../utils/response';
import checkAndAwardAchievements from './achievementController';

/**
 * @desc Get all favorites for the authenticated user (with full artifact details)
 * @route GET /api/favorites
 * @access Private
 */
export const getUserFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    // Find user and populate the favorites array with full artifact data
    const user = await User.findById(userId).populate({
      path: 'favorites',
      model: 'Artifact',
      select: '_id name slug description historicalPeriod category materials images museumCode stats'
    });
    
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Ensure favorites is an array and return full artifact objects
    const favoriteArtifacts = Array.isArray(user.favorites) ? user.favorites : [];
    
    console.log(`✅ User ${userId} has ${favoriteArtifacts.length} favorites`);

    // Return full artifact objects with proper response format
    return sendSuccess(res, favoriteArtifacts, 'User favorites retrieved successfully');
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return sendError(res, 'Failed to fetch favorites', 500);
  }
});

/**
 * @desc Get favorite artifact IDs only (lightweight)
 * @route GET /api/favorites/ids
 * @access Private
 */
export const getFavoriteIds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId).select('favorites');
    
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const favoriteIds = Array.isArray(user.favorites) ? user.favorites.map(fav => 
      typeof fav === 'string' ? fav : fav._id
    ) : [];

    return sendSuccess(res, favoriteIds, 'Favorite IDs retrieved');
  } catch (error) {
    console.error('Error fetching favorite IDs:', error);
    return sendError(res, 'Failed to fetch favorites', 500);
  }
});

/**
 * @desc Toggle favorite status for an artifact
 * @route POST /api/favorites/:artifactId
 * @access Private
 */
export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { artifactId } = req.params;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    // Verify artifact exists
    const artifact = await Artifact.findById(artifactId);
    if (!artifact) {
      return sendError(res, 'Artifact not found', 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if artifact is already favorited
    const isFavoritedIndex = user.favorites.findIndex(
      (fav) => fav.toString() === artifactId
    );

    let isFavorited: boolean;
    if (isFavoritedIndex > -1) {
      // Already favorited – remove it
      user.favorites.splice(isFavoritedIndex, 1);
      isFavorited = false;
      user.stats.favoritesCount = Math.max(0, (user.stats.favoritesCount || 0) - 1);
      console.log(`❌ Removed artifact ${artifactId} from favorites for user ${userId}`);
    } else {
      // Not favorited – add it
      user.favorites.push(artifact._id);
      isFavorited = true;
      user.stats.favoritesCount = (user.stats.favoritesCount || 0) + 1;
      console.log(`✅ Added artifact ${artifactId} to favorites for user ${userId}`);
    }

    await user.save();

    // Check and award achievements (achievements persist, only favorites count changes)
    await checkAndAwardAchievements(userId, 'favoritesCount');

    return sendSuccess(
      res,
      { artifactId, isFavorited },
      `Artifact ${isFavorited ? 'added to' : 'removed from'} favorites`
    );
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return sendError(res, 'Failed to update favorite status', 500);
  }
});

/**
 * @desc Remove a favorite
 * @route DELETE /api/favorites/:artifactId
 * @access Private
 */
export const removeFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { artifactId } = req.params;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const index = user.favorites.findIndex(fav => fav.toString() === artifactId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      user.stats.favoritesCount = Math.max(0, (user.stats.favoritesCount || 0) - 1);
      await user.save();
      return sendSuccess(res, { artifactId }, 'Artifact removed from favorites');
    }

    return sendError(res, 'Artifact not in favorites', 404);
  } catch (error) {
    console.error('Error removing favorite:', error);
    return sendError(res, 'Failed to remove favorite', 500);
  }
});

/**
 * @desc Clear all favorites for user
 * @route DELETE /api/favorites
 * @access Private
 */
export const clearAllFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const count = user.favorites.length;
    user.favorites = [];
    user.stats.favoritesCount = 0;
    await user.save();

    return sendSuccess(res, { clearedCount: count }, `Cleared ${count} favorites`);
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return sendError(res, 'Failed to clear favorites', 500);
  }
});