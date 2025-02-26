import express from 'express';
import GuestbookController from '../controllers/GuestbookController.mjs';

const router = express.Router();

// Add a guestbook message
router.post('/:eventId/add-message', GuestbookController.addMessage);

// Get guestbook messages for an event
router.get('/:eventId/messages', GuestbookController.getMessages);


// React to a guestbook message
router.post('/:messageId/react', GuestbookController.reactToMessage);

export default router;
