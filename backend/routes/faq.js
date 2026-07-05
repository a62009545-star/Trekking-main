import express from 'express';
import { protect } from '../middleware/auth.js';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../controllers/contentController.js';

const router = express.Router();

router.get('/', getFAQs);
router.post('/', protect, createFAQ);
router.put('/:id', protect, updateFAQ);
router.delete('/:id', protect, deleteFAQ);

export default router;