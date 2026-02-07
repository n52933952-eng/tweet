import multer from 'multer'

/**
 * Multer Configuration for File Uploads
 * 
 * Uses memory storage - files stored in RAM temporarily
 * Then uploaded to Cloudinary (no local disk storage)
 * 
 * Supports: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, MOV)
 */

// Configure storage: memory storage (buffer)
const storage = multer.memoryStorage()

// File filter: only accept images and videos
const fileFilter = (req, file, cb) => {
  // Check mimetype
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true) // Accept file
  } else {
    cb(new Error('Only images and videos are allowed'), false) // Reject file
  }
}

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit (Twitter allows up to ~5MB images, ~512MB videos)
  }
})

export default upload
