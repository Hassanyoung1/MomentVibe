/**
 * Event Expiry Job
 * --------------------
 * Runs daily to archive expired events.
 */

import Event from '../models/Event.mjs';
import ArchivedEvent from '../models/ArchivedEvent.mjs';
import cron from 'node-cron';

/**
 * Archive Expired Events
 * --------------------
 * Moves expired events to the archive and deletes the original.
 */
async function archiveExpiredEvents() {
  try {
    const now = new Date();
    const expiredEvents = await Event.find({ expiresAt: { $lt: now } });

    for (const event of expiredEvents) {
      // Move event data to archive
      const archivedEvent = new ArchivedEvent({
        originalEventId: event._id,
        name: event.name,
        description: event.description,
        date: event.date,
        host: event.host,
        media: event.media,
      });

      await archivedEvent.save();
      await Event.findByIdAndDelete(event._id);
    }

    console.log(`${expiredEvents.length} events archived.`);
  } catch (error) {
    console.error('Error archiving events:', error);
  }
}

// Run job every midnight
cron.schedule('0 0 * * *', archiveExpiredEvents);
