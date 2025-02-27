import ArchivedEvent from '../models/ArchivedEvent.mjs';

/**
 * Get Archived Event
 * --------------------
 * Retrieves details of an archived event by ID.
 */
class ArchivedEventController {
  static async getArchivedEvent(req, res) {
    const { eventId } = req.params;

    try {
      const archivedEvent = await ArchivedEvent.findOne({ originalEventId: eventId });

      if (!archivedEvent) {
        return res.status(404).json({ error: 'Archived event not found' });
      }

      res.status(200).json(archivedEvent);
    } catch (error) {
      console.error('Error fetching archived event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default ArchivedEventController;
