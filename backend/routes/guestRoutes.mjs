import express from 'express';
import GuestController from '../controllers/GuestController.mjs';

const router = express.Router();

// Register a guest
router.post('/register', GuestController.registerGuest);


export default router;