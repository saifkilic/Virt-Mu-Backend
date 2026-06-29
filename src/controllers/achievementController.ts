// src/controllers/achievementController.ts
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { sendResponse as sendSuccess, sendError } from '../utils/response';

// Achievement thresholds and definitions
const ACHIEVEMENT_DEFINITIONS = {
  // Saves achievements
  first_save: {
    id: 'first_save',
    name: { en: 'First Steps', ur: 'پہلی کوشش' },
    description: { en: 'Save your first artifact', ur: 'اپنی پہلی چیز محفوظ کریں' },
    type: 'saves',
    threshold: 1,
  },
  five_saves: {
    id: 'five_saves',
    name: { en: 'Collection Starter', ur: 'کلیکشن کا آغاز' },
    description: { en: 'Save 5 artifacts', ur: '5 چیزیں محفوظ کریں' },
    type: 'saves',
    threshold: 5,
  },
  ten_saves: {
    id: 'ten_saves',
    name: { en: 'Curator', ur: 'کیوریٹر' },
    description: { en: 'Save 10 artifacts', ur: '10 چیزیں محفوظ کریں' },
    type: 'saves',
    threshold: 10,
  },
  twenty_saves: {
    id: 'twenty_saves',
    name: { en: 'Collector', ur: 'کلیکٹر' },
    description: { en: 'Save 20 artifacts', ur: '20 چیزیں محفوظ کریں' },
    type: 'saves',
    threshold: 20,
  },
  fifty_saves: {
    id: 'fifty_saves',
    name: { en: 'Passionate Collector', ur: 'شوقین کلیکٹر' },
    description: { en: 'Save 50 artifacts', ur: '50 چیزیں محفوظ کریں' },
    type: 'saves',
    threshold: 50,
  },

  // Comments achievements
  first_comment: {
    id: 'first_comment',
    name: { en: 'Voice Heard', ur: 'آواز سنی گئی' },
    description: { en: 'Leave your first comment', ur: 'اپنی پہلی تبصرہ چھوڑیں' },
    type: 'comments',
    threshold: 1,
  },
  five_comments: {
    id: 'five_comments',
    name: { en: 'Engaged Enthusiast', ur: 'شامل حماسی' },
    description: { en: 'Leave 5 comments', ur: '5 تبصرے چھوڑیں' },
    type: 'comments',
    threshold: 5,
  },
  ten_comments: {
    id: 'ten_comments',
    name: { en: 'Heritage Enthusiast', ur: 'وراثت کا شوقین' },
    description: { en: 'Leave 10 comments', ur: '10 تبصرے چھوڑیں' },
    type: 'comments',
    threshold: 10,
  },
  twenty_comments: {
    id: 'twenty_comments',
    name: { en: 'Knowledge Sharer', ur: 'علم کا شریک' },
    description: { en: 'Leave 20 comments', ur: '20 تبصرے چھوڑیں' },
    type: 'comments',
    threshold: 20,
  },
  fifty_comments: {
    id: 'fifty_comments',
    name: { en: 'Expert Contributor', ur: 'ماہر تعاون کار' },
    description: { en: 'Leave 50 comments', ur: '50 تبصرے چھوڑیں' },
    type: 'comments',
    threshold: 50,
  },
};

/**
 * Check and award achievements for user activity
 * Called whenever favorites or comments count changes
 * NOTE: This is a HELPER FUNCTION, not an Express middleware
 */
export const checkAndAwardAchievements = async (
  userId: string, 
  statsType: 'favoritesCount' | 'commentsCount'
): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const currentCount = user.stats[statsType] || 0;
    const existingAchievementIds = user.achievements.map(a => a.id);

    // Determine which achievements to check based on stats type
    const relevantAchievements = Object.values(ACHIEVEMENT_DEFINITIONS).filter(
      ach => ach.type === (statsType === 'favoritesCount' ? 'saves' : 'comments')
    );

    // Check each achievement
    for (const achievementDef of relevantAchievements) {
      // If user meets threshold and hasn't already earned it
      if (currentCount >= achievementDef.threshold && !existingAchievementIds.includes(achievementDef.id)) {
        user.achievements.push({
          id: achievementDef.id,
          name: typeof achievementDef.name === 'string' ? achievementDef.name : achievementDef.name.en,
          description: typeof achievementDef.description === 'string' ? achievementDef.description : achievementDef.description.en,
          type: achievementDef.type as any,
          threshold: achievementDef.threshold,
          earnedAt: new Date(),
        } as any);

        console.log(`🏆 Achievement unlocked for user ${userId}: ${achievementDef.id}`);
      }
    }

    await user.save();
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

/**
 * @desc Get user achievements
 * @route GET /api/achievements
 * @access Private
 */
export const getUserAchievements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId).select('achievements');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user.achievements, 'Achievements retrieved successfully');
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return sendError(res, 'Failed to fetch achievements', 500);
  }
});

/**
 * @desc Get achievement definitions (for frontend to show progress)
 * @route GET /api/achievements/definitions
 * @access Public
 */
export const getAchievementDefinitions = asyncHandler(async (req: Request, res: Response) => {
  try {
    return sendSuccess(res, ACHIEVEMENT_DEFINITIONS, 'Achievement definitions retrieved');
  } catch (error) {
    console.error('Error fetching achievement definitions:', error);
    return sendError(res, 'Failed to fetch achievement definitions', 500);
  }
});

export default checkAndAwardAchievements;