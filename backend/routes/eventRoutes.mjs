import express from 'express';
import EventController from '../controllers/EventController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';

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

export default router;