import Event from '../models/Event.mjs';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import defaultAlbums from '../config/defaultAlbums.mjs';
import Album from '../models/Album.mjs';
import Guest from '../models/Guest.mjs';
import { v4 as uuidv4 } from 'uuid';



class EventController {
 
  static async createEvent(req, res) {
    const { name, description, date, guests, media } = req.body;
    const { userId } = req;

    if (!name || !description || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newEvent = new Event({ name, description, date, host: userId, guests, media });
      await newEvent.save();

       // Auto-create system albums
    const albums = await Promise.all(
      defaultAlbums.map(async (album) => {
        const newAlbum = new Album({
          eventId: newEvent._id,
          name: album.name,
          description: album.description,
          isAutoGenerated: true,
        });
        await newAlbum.save();
        return newAlbum._id;
      })
    );

    newEvent.albums = albums;
    await newEvent.save();

      res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
      console.error('Error during event creation:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }

  static async updateEvent(req, res) {
    const { eventId } = req.params;
    const { name, description, date, guests, media } = req.body;
    const { userId } = req;

    if (!name || !description || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { name, description, date, guests, media, host: userId },
        { new: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
      console.error('Error during event update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async deleteEvent(req, res) {
    const { eventId } = req.params;
    const { userId } = req;

    try {
      const event = await Event.findOneAndDelete({ _id: eventId, host: userId });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error during event deletion:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getEvent(req, res) {
    const { id } = req.params;

    try {
      const trimmedId = id.trim().replace(/"/g, '');
      if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }

      const event = await Event.findById(trimmedId).populate('media');

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(200).json(event);
    } catch (error) {
      console.error('Error during event retrieval:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  
  static async getEventsByHost(req, res) {
    const { userId } = req;

    try {
      const events = await Event.find({ host: userId }).populate('media');
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events by host:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getEventsByDateRange(req, res) {
    const { startDate, endDate } = req.query;
    const { userId } = req;

    try {
      const events = await Event.find({
        host: userId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).populate('media');

      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getEventsPaginated(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const { userId } = req;

    try {
      const events = await Event.find({ host: userId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('media');

      const totalEvents = await Event.countDocuments({ host: userId });

      res.status(200).json({
        events,
        totalPages: Math.ceil(totalEvents / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error fetching paginated events:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getEventsWithFilter(req, res) {
    const { name, date, sortBy = 'date', order = 'asc' } = req.query;
    const { userId } = req;

    const filter = { host: userId };
    if (name) filter.name = new RegExp(name, 'i');
    if (date) filter.date = new Date(date);

    const sortOrder = order === 'asc' ? 1 : -1;

    try {
      const events = await Event.find(filter)
        .sort({ [sortBy]: sortOrder })
        .populate('media');

      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching filtered events:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  static async generateEventQR(req, res) {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId);
      
      if (!event) return res.status(404).json({ error: "Event not found" });
  
      // URL guests will scan to upload media
      const baseUrl = process.env.FRONTEND_URL || req.protocol + '://' + req.get('host');
      const qrUploadUrl = `${baseUrl}/guest/upload?eventId=${eventId}`;
  
      // Check if QR Code URL already exists
      if (event.qrCodeUrl) {
        return res.status(200).json({ message: "QR Code already exists", qrUploadUrl: event.qrCodeUrl });
      }
  
      // Generate QR code image
      const qrImage = await QRCode.toDataURL(qrUploadUrl);
  
      // Save QR URL in the event
      event.qrCodeUrl = qrUploadUrl;
      await event.save();
  
      res.status(201).json({ message: "QR Code generated", qrUploadUrl, qrImage });
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  }
  /**
   * Update Download & Sharing Settings
   * --------------------
   * Allows hosts to control who can download or share media.
   */
  static async updatePermissions(req, res) {
    const { eventId } = req.params;
    const { allowDownload, allowSharing } = req.body;

    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { allowDownload, allowSharing },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(200).json({ message: 'Permissions updated successfully', event });
    } catch (error) {
      console.error('Error updating permissions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Extend Event Expiration
   * --------------------
   * Allows the host to extend an event’s expiration date.
   */
  static async extendExpiration(req, res) {
    const { eventId } = req.params;
    const { newExpirationDate } = req.body;

    if (!newExpirationDate) {
      return res.status(400).json({ error: 'New expiration date is required' });
    }

    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { expiresAt: new Date(newExpirationDate) },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(200).json({ message: 'Event expiration updated', event });
    } catch (error) {
      console.error('Error updating event expiration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
 

  /**
   * Generate QR Code with Guest Token
   * --------------------
   * When a guest scans the QR code, they receive a unique token for tracking.
   */
  static async generateGuestQR(req, res) {
    try {
      const { eventId } = req.params;
      const { guestName, guestEmail } = req.body || {};
      const guestToken = uuidv4(); // Generate unique token

      // Store guest in database (anonymous)
      const newGuest = new Guest({
        eventId,
        guestToken,
        name: guestName || 'Anonymous',   // Default name
        email: guestEmail || '',           // Default empty email
      });      
      await newGuest.save();

      // Generate QR code linking to guest upload page
      const baseUrl = process.env.FRONTEND_URL || req.protocol + '://' + req.get('host');
      const qrUploadUrl = `${baseUrl}/guest/upload?eventId=${eventId}&guestToken=${guestToken}`;
      const qrImage = await QRCode.toDataURL(qrUploadUrl);

      res.json({ qrUploadUrl, qrImage, guestToken });
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  }
}

export default EventController;