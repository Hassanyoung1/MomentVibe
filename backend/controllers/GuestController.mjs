import Guest from '../models/Guests.mjs';

class GuestController {
  static async registerGuest(req, res) {
    const { eventId, name, email } = req.body;

    if (!eventId || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const guest = new Guest({ eventId, name, email });
      await guest.save();

      res.status(201).json({ message: 'Guest registered successfully', guest });
    } catch (error) {
      console.error('Error during guest registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default GuestController;