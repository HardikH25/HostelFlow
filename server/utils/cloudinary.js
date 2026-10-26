import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary credentials with trimmed values
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : '',
    api_key: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : '',
    api_secret: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : ''
});

/**
 * Uploads a memory buffer (Image or PDF) to Cloudinary via stream.
 * Uses resource_type: 'auto' so Cloudinary handles both images and PDF documents natively.
 * 
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} originalname - Original filename
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<object>} Cloudinary upload result containing secure_url
 */
export const uploadToCloudinary = (buffer, originalname, folder = 'hostelflow_documents') => {
    return new Promise((resolve, reject) => {
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return reject(new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing in server/.env'));
        }

        const isPdf = originalname.toLowerCase().endsWith('.pdf');

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
                public_id: `${Date.now()}-${originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`,
                format: isPdf ? 'pdf' : undefined
            },
            (error, result) => {
                if (error) {
                    console.error('[CLOUDINARY UPLOAD ERROR]:', error);
                    return reject(error);
                }
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * Deletes an uploaded file (Image or PDF) from Cloudinary using its public_id.
 * 
 * @param {string} publicId - Cloudinary public_id (e.g. 'hostelflow_documents/...')
 * @param {string} resourceType - 'image' or 'raw' (default: 'image')
 * @returns {Promise<object>} Cloudinary destroy result { result: 'ok' }
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        let res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        if (res.result !== 'ok' && resourceType !== 'raw') {
            res = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }
        return res;
    } catch (err) {
        console.error('[CLOUDINARY DELETE ERROR]:', err);
        throw err;
    }
};

export default cloudinary;
