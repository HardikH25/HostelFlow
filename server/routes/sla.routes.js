import express from 'express';
import { triggerSLACheckManual, getSLAMetrics } from '../controllers/sla.controller.js';
import isAuthenticated from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.get('/metrics', isAuthenticated, getSLAMetrics);
router.post('/trigger-check', isAuthenticated, verifyRole('Warden', 'Technician'), triggerSLACheckManual);

export default router;
