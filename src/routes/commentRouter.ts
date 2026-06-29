// src/routes/commentRouter.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController';

const router = Router();

// Public read routes
router.get('/', getComments);
router.get('/:id', getComment);

// Protected write routes
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
