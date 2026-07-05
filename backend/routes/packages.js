import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadPackageImages } from '../middleware/upload.js';
import {
  getPackages,
  getPackageBySlug,
  getAllPackagesAdmin,
  getPackageByIdAdmin,
  createPackage,
  updatePackage,
  deletePackage,
  deletePackageImage,
} from '../controllers/packageController.js';

const router = express.Router();

// Admin routes (note: defined before "/:slug" to avoid "admin" being treated as a slug)
router.get('/admin/all', protect, getAllPackagesAdmin);
router.get('/admin/:id', protect, getPackageByIdAdmin);

// Public routes
router.get('/', getPackages);
router.get('/:slug', getPackageBySlug);

// Admin write routes
router.post('/', protect, uploadPackageImages, createPackage);
router.put('/:id', protect, uploadPackageImages, updatePackage);
router.delete('/:id', protect, deletePackage);
router.delete('/:id/image', protect, deletePackageImage);

export default router;