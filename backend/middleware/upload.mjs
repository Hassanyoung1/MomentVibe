import multer from 'multer';

// Configure Multer to handle file uploads in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('File filter:', file.mimetype);
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true); // Accept image/video files
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB
});

export default upload;