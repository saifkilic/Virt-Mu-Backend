import { Router } from 'express';
import { 
  register, 
  login,
  refreshAccessToken,
  logout,
  getCurrentUser, 
  getUserProfile, 
  updateUserProfile, 
  getUserStats 
} from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';
import { protect } from '../middlewares/auth';

const router = Router();

// Public auth routes (with rate limiting)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Token refresh route (public - no auth required)
// This allows clients to refresh their token without needing a valid JWT
router.post('/refresh', authLimiter, refreshAccessToken);

// Protected user routes
router.get('/me', protect, getCurrentUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/stats', protect, getUserStats);

// Logout route - invalidates refresh tokens
router.post('/logout', protect, logout);

export default router;