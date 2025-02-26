import express from 'express';
import MediaController from '../controllers/MediaController.mjs';
import upload from '../middleware/upload.mjs';
import { bucket } from '../config/gridfs.mjs';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.mjs';
import { publicUploadLimiter, ipUploadLimiter} from '../middleware/rateLimiter.mjs';
// import { virusScanner } from '../middleware/virusScan.mjs';

const router = express.Router();

router.put('/approve/:mediaId', authMiddleware('host'), MediaController.approveMedia);
router.get('/live/:eventId', MediaController.getLiveMedia);


// Upload media with security layers
router.post(
  '/upload',
  ipUploadLimiter, // IP-based rate limiting first
  publicUploadLimiter, // General rate limiting
  upload.single('media'), // File upload handling// Virus scanning
  MediaController.uploadMedia
);

// Guest Media Upload Route (No Authentication)
router.post(
  '/guest/upload', 
  upload.single('media'), 
  MediaController.guestUploadMedia
);

// Get host media
router.get(
  '/host', 
  authMiddleware('host'), 
  MediaController.getHostMedia
);

// Get media file
router.get('/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const objectId = new mongoose.Types.ObjectId(fileId);
    const file = await bucket.find({ _id: objectId }).next();

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=31536000' // 1 year cache
    });

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on('error', () => res.status(500).end());
    downloadStream.pipe(res);

  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;