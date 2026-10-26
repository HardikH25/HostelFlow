import multer from 'multer';

// Memory Storage: Files are held in memory buffer and streamed directly to Cloudinary
// No files are saved to the local filesystem
const storage = multer.memoryStorage();

// File Type Validation (Images & PDFs)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, GIF images and PDF documents are allowed.'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    }
});

export default upload;
