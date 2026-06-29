// src/controllers/commentController.ts
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Artifact } from '../models/Artifact';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { sendResponse as sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import checkAndAwardAchievements from './achievementController';

// Helper to recompute average rating and count for an artifact
const recomputeArtifactRating = async (artifactId: string) => {
  const result = await Comment.aggregate([
    {
      $match: {
        artifactId: new mongoose.Types.ObjectId(artifactId),
        rating: { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);
  const avgRating = result[0]?.avgRating || 0;
  const ratingCount = result[0]?.ratingCount || 0;
  await Artifact.findByIdAndUpdate(artifactId, {
    $set: {
      'stats.averageRating': avgRating,
      'stats.ratingCount': ratingCount,
    },
  });
};

// @desc Create a comment
// @route POST /api/comments
export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { artifactId, museumCode, rating, text } = req.body;
  if (!artifactId || !museumCode || !text) {
    return sendError(res, 'artifactId, museumCode and text are required', 400);
  }

  // Guard clause to ensure user is authenticated
  if (!req.user?.id) {
    return sendError(res, 'Not authorized', 401);
  }
  
  const comment = await Comment.create({
    userId: req.user.id,
    artifactId,
    museumCode,
    rating,
    text,
    isApproved: true,
  });

  // Update user's comment count
  const user = await User.findById(req.user.id);
  if (user) {
    user.stats.commentsCount = (user.stats.commentsCount || 0) + 1;
    await user.save();

    // Check and award achievements
    await checkAndAwardAchievements(req.user.id, 'commentsCount');
  }

  // Update artifact rating stats
  if (rating) await recomputeArtifactRating(artifactId);
  
  sendSuccess(res, comment, 'Comment created', 201);
});

// @desc Get comments (optionally filtered by artifact)
// @route GET /api/comments
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { artifactId, page = '1', limit = '10' } = req.query as any;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const filter: any = {};
  if (artifactId) filter.artifactId = artifactId;

  const total = await Comment.countDocuments(filter);
  const comments = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const pagination = {
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  };

  sendSuccess(res, { comments, pagination }, 'Comments retrieved');
});

// @desc Get single comment by id
// @route GET /api/comments/:id
export const getComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return sendError(res, 'Comment not found', 404);
  sendSuccess(res, comment, 'Comment retrieved');
});

// @desc Update comment (only author can update)
// @route PUT /api/comments/:id
export const updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return sendError(res, 'Comment not found', 404);

  if (!req.user?.id) {
    return sendError(res, 'Not authorized', 401);
  }

  if (comment.userId.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to edit this comment', 403);
  }
  const updates = req.body;
  if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
    return sendError(res, 'Rating must be between 1 and 5', 400);
  }
  Object.assign(comment, updates);
  await comment.save();
  // Recompute rating stats after update
  if (updates.rating !== undefined) await recomputeArtifactRating(comment.artifactId.toString());
  sendSuccess(res, comment, 'Comment updated');
});

// @desc Delete comment (only author or admin)
// @route DELETE /api/comments/:id
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return sendError(res, 'Comment not found', 404);

  if (!req.user?.id) {
    return sendError(res, 'Not authorized', 401);
  }

  const isAuthor = comment.userId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isAuthor && !isAdmin) {
    return sendError(res, 'Not authorized to delete this comment', 403);
  }
  
  const artifactId = comment.artifactId.toString();
  const hadRating = !!comment.rating;
  
  // Decrement user's comment count (but achievements persist)
  const user = await User.findById(comment.userId);
  if (user) {
    user.stats.commentsCount = Math.max(0, (user.stats.commentsCount || 0) - 1);
    await user.save();
  }
  
  await comment.deleteOne();
  
  // Recompute rating stats if the deleted comment had a rating
  if (hadRating) await recomputeArtifactRating(artifactId);
  
  sendSuccess(res, null, 'Comment deleted');
});