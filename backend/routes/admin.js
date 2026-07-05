import express from 'express';
import { protect } from '../middleware/auth.js';
import { login, logout, verify, changePassword } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/verify', protect, verify);
router.patch('/change-password', protect, changePassword);

export default router;