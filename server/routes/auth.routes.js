import express from 'express';
import { register, login, logout, getMe, changePassword, updateProfile } from '../controllers/auth.controller.js';
import isAuthenticated from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, getMe);
router.put('/change-password', isAuthenticated, changePassword);
router.put('/profile', isAuthenticated, updateProfile);

export default router;
