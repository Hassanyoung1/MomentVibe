import express from 'express';
import ArchivedEventController from '../controllers/ArchivedEventController.mjs';

const router = express.Router();

// Get archived event details
router.get('/:eventId', ArchivedEventController.getArchivedEvent);

export default router;
