import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { upload } from '../config/cloudinary';
import { validateRequest } from '../middlewares/validate';
import { createArtifactSchema } from '../validations/artifactValidation';
import { createArtifact, getArtifacts, getArtifact, updateArtifact, deleteArtifact } from '../controllers/artifactController';

const router = Router();

router.get('/', getArtifacts);
router.get('/:id', getArtifact);
router.post('/', protect, upload.single('image'), validateRequest(createArtifactSchema), createArtifact);
router.put('/:id', protect, upload.single('image'), updateArtifact);
router.delete('/:id', protect, deleteArtifact);

export default router;