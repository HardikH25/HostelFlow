import express from 'express';
import isAuthenticated from '../middlewares/authMiddleware.js';
import { uploadFiles } from '../controllers/upload.controller.js';

const router = express.Router();

/**
 * POST /api/upload
 * Supports uploading up to 5 documents/images at once directly to Cloudinary
 */
router.post('/', isAuthenticated, uploadFiles);

export default router;
