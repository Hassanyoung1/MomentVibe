import Reaction from '../models/Reaction.mjs';

class ReactionController {
  static async addReaction(req, res) {
    const { mediaId, guestId, type, comment } = req.body;

    if (!mediaId || !guestId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const reaction = new Reaction({ mediaId, guestId, type, comment });
      await reaction.save();

      res.status(201).json({ message: 'Reaction added successfully', reaction });
    } catch (error) {
      console.error('Error during reaction addition:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default ReactionController;