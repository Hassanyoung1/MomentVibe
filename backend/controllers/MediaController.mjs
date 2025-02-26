import { bucket } from '../config/gridfs.mjs';
import Media from '../models/Media.mjs';
import Event from '../models/Event.mjs';
import User from '../models/User.mjs';
import { getIO } from '../config/socket.mjs';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '../utils/sendEmail.mjs'; // Use default import
import Album from '../models/Album.mjs';

class MediaController {
  static async uploadMedia(req, res) {
    const { eventId, albumId } = req.body; // Accept albumId in request
    const file = req.file;

    if (!eventId || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      // If an albumId is provided, check if the album exists and belongs to the event
      if (albumId) {
        const album = await Album.findById(albumId);
        if (!album || album.eventId.toString() !== eventId) {
          return res.status(400).json({ error: 'Invalid album ID or album does not belong to the event' });
        }
      }

      // Private event authorization
      if (event.visibility === 'private') {
        const guestId = req.cookies && req.cookies.guestId;
        if (!guestId || !event.guests.includes(guestId)) {
          return res.status(403).json({ error: 'Unauthorized for private event' });
        }
      }

      const filename = `${uuidv4()}-${file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
      });

      const media = new Media({
        eventId,
        albumId: albumId || null, // Link media to album if provided
        type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        filename,
        fileId: uploadStream.id,
      });

      uploadStream.on('finish', async () => {
        try {
          await media.save();
          await Event.findByIdAndUpdate(eventId, { $push: { media: media._id } });

          if (albumId) {
            await Album.findByIdAndUpdate(albumId, { $push: { media: media._id } });
          }

          getIO().to(eventId).emit('newMedia', media);

          // Send notification to host
          const host = await User.findById(event.host);
          if (host) {
            await sendEmail(
              host.email,
              'New Media Uploaded to Your Event',
              `New ${media.type} uploaded to "${event.name}": 
              ${process.env.FRONTEND_URL}/media/${media._id}`
            );
          }

          res.status(201).json({
            message: 'Media uploaded successfully',
            media: media.toObject(),
          });
        } catch (error) {
          console.error('Post-upload error:', error);
          res.status(500).json({ error: 'Failed to finalize upload' });
        }
      });

      uploadStream.on('error', (error) => {
        console.error('GridFS upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
      });

      uploadStream.end(file.buffer);
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getHostMedia(req, res) {
    try {
      const { userId } = req;
      const { eventId, type, startDate, endDate } = req.query;

      // Build base query
      const query = { 
        host: userId,
        ...(eventId && { _id: eventId })
      };

      // Find host's events
      const events = await Event.find(query).lean();
      if (!events.length) return res.status(200).json({ media: [] });

      // Build media filter
      const mediaFilter = {
        eventId: { $in: events.map(e => e._id) },
        ...(type && ['photo', 'video'].includes(type) && { type }),
        ...(startDate && endDate && {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        })
      };

      // Get populated media
      const media = await Media.find(mediaFilter)
        .populate('eventId', 'name date')
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({ 
        media: media.map(m => ({
          ...m,
          url: `/api/media/file/${m.fileId}`
        }))
      });

    } catch (error) {
      console.error('Media retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve media' });
    }
  }

  static async approveMedia(req, res) {
    const { mediaId } = req.params;
  
    try {
      const media = await Media.findByIdAndUpdate(mediaId, { status: 'approved' }, { new: true });
  
      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }
  
      res.status(200).json({ message: 'Media approved successfully', media });
    } catch (error) {
      console.error('Error approving media:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getLiveMedia(req, res) {
    const { eventId } = req.params;

    try {
        const media = await Media.find({ eventId })
            .sort({ createdAt: -1 }) // Show newest uploads first
            .limit(10); // Limit to latest 10 items

        res.status(200).json(media);
    } catch (error) {
        console.error('Error fetching live media:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async guestUploadMedia(req, res) {
    const { eventId } = req.body;
    const file = req.file;

    if (!eventId || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const filename = `${uuidv4()}-${file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
      });

      const media = new Media({
        eventId,
        type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        filename,
        fileId: uploadStream.id,
      });

      uploadStream.on('finish', async () => {
        try {
          await media.save();
          await Event.findByIdAndUpdate(eventId, { $push: { media: media._id } });

          res.status(201).json({ message: 'Media uploaded successfully', media });
        } catch (error) {
          console.error('Post-upload error:', error);
          res.status(500).json({ error: 'Failed to finalize upload' });
        }
      });

      uploadStream.end(file.buffer);
    } catch (error) {
      console.error('Guest media upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}  

export default MediaController;
