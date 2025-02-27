import User from '../models/User.mjs';
import Event from '../models/Event.mjs';
import Guest from '../models/Guest.mjs';
import Media from '../models/Media.mjs';


class HostController {
  static async getHostData(req, res) {
    const { hostId } = req.params;

    if (!hostId) {
      return res.status(400).json({ error: 'Missing required parameter: hostId' });
    }

    try {
      // Find the host
      const host = await User.findById(hostId);
      if (!host) {
        return res.status(404).json({ error: 'Host not found' });
      }

      // Find events created by the host
      const events = await Event.find({ host: hostId }).populate('media').populate('guests');

      // Find guests invited to the host's events
      const guestIds = events.flatMap(event => event.guests);
      const guests = await Guest.find({ _id: { $in: guestIds } });

      // Find media associated with the host's events
      const mediaIds = events.flatMap(event => event.media);
      const media = await Media.find({ _id: { $in: mediaIds } });

      res.status(200).json({ host, events, guests, media });
    } catch (error) {
      console.error('Error retrieving host data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default HostController;