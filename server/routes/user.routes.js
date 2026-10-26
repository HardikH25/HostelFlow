import express from 'express';
import { getStaff, createStaffMember } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.get('/staff', isAuthenticated, getStaff);
router.post('/staff', isAuthenticated, verifyRole('Warden'), createStaffMember);

export default router;
