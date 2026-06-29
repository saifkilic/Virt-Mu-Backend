import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { upload } from '../config/cloudinary';
import { validateRequest } from '../middlewares/validate';
import { createMuseumSchema } from '../validations/museumValidation';
import { createMuseum, getMuseums, getMuseum, updateMuseum, deleteMuseum } from '../controllers/museumController';

const router = Router();

router.get('/', getMuseums);
router.get('/:id', getMuseum);
router.post('/', protect, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'heroImage', maxCount: 1 }]), validateRequest(createMuseumSchema), createMuseum);
router.put('/:id', protect, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'heroImage', maxCount: 1 }]), updateMuseum);
router.delete('/:id', protect, deleteMuseum);

export default router;