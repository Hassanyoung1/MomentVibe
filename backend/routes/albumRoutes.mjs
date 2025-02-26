import express from 'express';
import AlbumController from '../controllers/AlbumController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.post('/:eventId/create', authMiddleware('host'), AlbumController.createAlbum); // Create a new album
router.get('/:eventId', AlbumController.getAlbumsByEvent); // Get all albums for an event
router.put('/:albumId', authMiddleware('host'), AlbumController.updateAlbum); // Update album info
router.delete('/:albumId', authMiddleware('host'), AlbumController.deleteAlbum); // Delete an album

export default router;
