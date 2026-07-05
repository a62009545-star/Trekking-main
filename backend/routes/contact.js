import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  submitContact,
  getAllContacts,
  markContactRead,
  deleteContact,
} from '../controllers/contentController.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, getAllContacts);
router.patch('/:id/read', protect, markContactRead);
router.delete('/:id', protect, deleteContact);

export default router;