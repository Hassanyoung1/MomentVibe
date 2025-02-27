import express from 'express';
import MediaController from '../controllers/MediaController.mjs';
import upload from '../middleware/upload.mjs';
import { bucket } from '../config/gridfs.mjs';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.mjs';
import { publicUploadLimiter, ipUploadLimiter } from '../middleware/rateLimiter.mjs';


/// import { virusScanner } from '../middleware/virusScan.mjs'; // Ensure this import is correct

const router = express.Router();

// Approve media (Host Only)
router.put('/approve/:mediaId', authMiddleware('host'), MediaController.approveMedia);

// Get host media
router.get('/host', authMiddleware('host'), MediaController.getHostMedia);

// Download media with permission checks
router.get('/download/:mediaId', MediaController.downloadMedia);


// Get latest live media
router.get('/live/:eventId', MediaController.getLiveMedia);

// Get only visible media for an event
router.get('/:eventId', MediaController.getEventMedia);

// Allow hosts to update media visibility
router.put('/:mediaId/visibility', authMiddleware('host'), MediaController.updateMediaVisibility);

// Upload media with security layers
router.post(
  '/upload',
  ipUploadLimiter,
  publicUploadLimiter,
  upload.single('media'),
 // virusScanner, // Ensure this middleware is defined
  MediaController.uploadMedia
);

// Guest Media Upload Route (No Authentication)
router.post(
  '/guest/upload',
  upload.single('media'),
  MediaController.guestUploadMedia
);

// Get host media
router.get('/host', authMiddleware('host'), MediaController.getHostMedia);

// Restrict media downloads based on event settings
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

    // Fetch the event related to this media
    const media = await Media.findOne({ fileId: objectId }).populate('eventId');
    if (!media || !media.eventId) {
      return res.status(404).json({ error: 'Associated event not found' });
    }

    // Check if downloading is allowed
    if (media.eventId.allowDownload === false) {
      return res.status(403).json({ error: 'Downloading is disabled for this event' });
    }

    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=31536000'
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