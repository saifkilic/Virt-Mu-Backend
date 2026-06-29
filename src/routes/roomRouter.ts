import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { createRoom, getRooms, getRoom, updateRoom, deleteRoom } from '../controllers/roomController';

const router = Router();

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', protect, createRoom);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);

export default router;
