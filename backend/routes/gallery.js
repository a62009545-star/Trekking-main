import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadGalleryImages } from '../middleware/upload.js';
import {
  getGalleryImages,
  uploadGalleryImagesHandler,
  getAllGalleryImagesAdmin,
  deleteGalleryImage,
} from '../controllers/contentController.js';

const router = express.Router();

// Admin route defined before "/" public GET is fine since methods differ,
// but "/admin" must come before nothing conflicting here — kept explicit for clarity.
router.get('/admin', protect, getAllGalleryImagesAdmin);

router.get('/', getGalleryImages);
router.post('/', protect, uploadGalleryImages, uploadGalleryImagesHandler);
router.delete('/:id', protect, deleteGalleryImage);

export default router;