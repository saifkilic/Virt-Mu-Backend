import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { sendResponse as sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

// Token generation with 24-hour expiration (matching frontend)
const generateToken = (userId: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'defaultsecret';
  return jwt.sign({ id: userId, role }, secret, { expiresIn: '24h' });
};

// Generate refresh token (longer-lived, stored in DB)
// Refresh tokens expire after 30 days
const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate both tokens
const generateAuthTokens = (userId: string, role: string) => {
  const token = generateToken(userId, role);
  const refreshToken = generateRefreshToken();
  return { token, refreshToken };
};

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return sendError(res, 'Email, username and password are required', 400);
  }
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    return sendError(res, 'User with given email or username already exists', 409);
  }
  const user = await User.create({ 
    email, 
    username, 
    password, 
    emailVerified: false, 
    loginAttempts: 0, 
    preferences: { notifications: true, newsletter: false }, 
    stats: { 
      artifactsViewed: 0, 
      totalTimeSpent: 0, 
      commentsCount: 0, 
      favoritesCount: 0, 
      museumsVisited: [] 
    }, 
    favorites: [], 
    achievements: [],
    role: 'user',
    refreshTokens: [], // Initialize empty refresh tokens array
  });

  // Generate tokens
  const { token, refreshToken } = generateAuthTokens(user.id, user.role);
  
  // Store refresh token in DB with expiration
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days
  
  user.refreshTokens = [{
    token: refreshToken,
    expiresAt: refreshTokenExpiry,
  }] as any;
  await user.save();

  return sendSuccess(res, { 
    token,
    refreshToken, // Send refresh token to client
    user: { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      role: user.role,
    } 
  }, 'User registered');
});

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Generate tokens
  const { token, refreshToken } = generateAuthTokens(user.id, user.role);
  
  // Store refresh token in DB with expiration
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days
  
  // Keep only the latest refresh tokens (max 5)
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: refreshTokenExpiry,
  } as any);
  
  // Remove old/expired tokens and keep only latest 5
  user.refreshTokens = user.refreshTokens
    .filter((rt: any) => rt.expiresAt > new Date())
    .slice(-5);
  
  await user.save();

  return sendSuccess(res, { 
    token,
    refreshToken, // Send refresh token to client
    user: { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      role: user.role,
    } 
  }, 'Login successful');
});

/**
 * @desc Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', 400);
  }

  try {
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    // Generate new access token
    const { token: newToken, refreshToken: newRefreshToken } = generateAuthTokens(
      user.id,
      user.role
    );

    // Update refresh token in DB
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    // Remove old refresh token and add new one
    if (user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter(
        (rt: any) => rt.token !== refreshToken
      );
    }

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: refreshTokenExpiry,
    } as any);

    // Keep only latest 5 tokens
    user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();

    return sendSuccess(res, {
      token: newToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Error refreshing token:', error);
    return sendError(res, 'Failed to refresh token', 500);
  }
});

/**
 * @desc Logout user (invalidate refresh token)
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Clear all refresh tokens on logout
    user.refreshTokens = [];
    await user.save();

    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    return sendError(res, 'Failed to logout', 500);
  }
});

/**
 * @desc Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    }, 'User retrieved');
  } catch (error) {
    console.error('Error fetching user:', error);
    return sendError(res, 'Failed to fetch user', 500);
  }
});

/**
 * @desc Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    }, 'Profile retrieved');
  } catch (error) {
    console.error('Error fetching profile:', error);
    return sendError(res, 'Failed to fetch profile', 500);
  }
});

/**
 * @desc Update user profile (username and password)
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const { username, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Update username if provided
    if (username !== undefined && username !== null) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username: username,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return sendError(res, 'Username already taken', 409);
      }
      
      user.username = username;
    }

    // Update password if provided
    if (password !== undefined && password !== null) {
      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters', 400);
      }
      user.password = password;
    }

    await user.save();

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    }, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return sendError(res, error.message || 'Failed to update profile', 500);
  }
});

/**
 * @desc Get user stats
 * @route GET /api/auth/stats
 * @access Private
 */
export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user.stats, 'User stats retrieved');
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return sendError(res, 'Failed to fetch user stats', 500);
  }
});