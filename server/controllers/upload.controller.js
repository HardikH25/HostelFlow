import upload from '../middlewares/uploadMiddleware.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

/**
 * POST /api/upload
 * Supports uploading up to 5 documents/images at once directly to Cloudinary
 */
export const uploadFiles = (req, res) => {
    upload.array('files', 5)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error.'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files provided.'
            });
        }

        try {
            // Upload all files to Cloudinary concurrently
            const uploadPromises = req.files.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, file.originalname);
                return {
                    url: result.secure_url,
                    filename: file.originalname,
                    fileType: file.mimetype,
                    size: file.size,
                    publicId: result.public_id
                };
            });

            const filesData = await Promise.all(uploadPromises);

            return res.status(200).json({
                success: true,
                message: `${filesData.length} file(s) uploaded to Cloudinary successfully.`,
                files: filesData
            });
        } catch (uploadError) {
            console.error('Cloudinary upload failure:', uploadError);
            return res.status(500).json({
                success: false,
                message: uploadError.message || 'Failed to upload attachments to Cloudinary.'
            });
        }
    });
};
