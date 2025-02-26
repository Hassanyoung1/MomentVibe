import express from 'express';
import ReactionController from '../controllers/ReactionController.mjs';

const router = express.Router();

// Add a reaction
router.post('/add', ReactionController.addReaction);

export default router;