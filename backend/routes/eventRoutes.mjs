import express from 'express';
import EventController from '../controllers/EventController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';
import GuestController from '../controllers/GuestController.mjs';
import GuestbookController from '../controllers/GuestbookController.mjs';
import AlbumController from '../controllers/AlbumController.mjs';
import MediaController from '../controllers/MediaController.mjs';

const router = express.Router();

router.post('/create', authMiddleware('host'), EventController.createEvent);
router.put('/:eventId', authMiddleware('host'), EventController.updateEvent);
router.delete('/:eventId', authMiddleware('host'), EventController.deleteEvent);
router.get('/:id', EventController.getEvent);
router.get('/host/events', authMiddleware('host'), EventController.getEventsByHost);
router.get('/events/date-range', authMiddleware('host'), EventController.getEventsByDateRange);
router.get('/events/paginated', authMiddleware('host'), EventController.getEventsPaginated);
router.get('/events/filter', authMiddleware('host'), EventController.getEventsWithFilter);
router.get('/:eventId/qr', EventController.generateEventQR); // Add this line

// Generate QR code for guests
router.get('/:eventId/guest-qr', EventController.generateGuestQR);


// Update media permissions
router.put('/:eventId/permissions', authMiddleware('host'), EventController.updatePermissions);
// Extend expiration
router.put('/:eventId/extend-expiration', authMiddleware('host'), EventController.extendExpiration);

// Download all media
router.get('/:eventId/download-all', authMiddleware('host'), MediaController.downloadAllMedia);


router.put('/:eventId/download-permission', authMiddleware('host'), async (req, res) => {
    try {
      const { eventId } = req.params;
      const { allowDownload } = req.body;
  
      const event = await Event.findByIdAndUpdate(eventId, { allowDownload }, { new: true });
      if (!event) return res.status(404).json({ error: 'Event not found' });
  
      res.status(200).json({ message: 'Download permission updated', allowDownload });
    } catch (error) {
      console.error('Error updating download permission:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

export default router;