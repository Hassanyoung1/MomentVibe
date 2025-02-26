import express from 'express';
import HostController from '../controllers/HostController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Retrieve all information related to a host
router.get('/:hostId', authMiddleware('host'), HostController.getHostData);

export default router;