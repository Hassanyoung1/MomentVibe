import { bucket } from '../config/gridfs.mjs';
import Media from '../models/Media.mjs';
import Event from '../models/Event.mjs';
import User from '../models/User.mjs';
import Album from '../models/Album.mjs';
import { getIO } from '../config/socket.mjs';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '../utils/sendEmail.mjs'; // Use default import
import mongoose from 'mongoose';
import DownloadLog from '../models/DownloadLog.mjs';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import Guest from '../models/Guest.mjs';

/**
 * Media Controller
 * --------------------
 * Handles media uploads, retrieval, and scheduled visibility.
 */

class MediaController {

  /**
   * Get or Create Default Albums
   * --------------------
   * Automatically assigns media to an appropriate album based on type.
   */
  static async getOrCreateDefaultAlbum(eventId, albumName) {
    try {
      let album = await Album.findOne({ eventId, name: albumName });

      if (!album) {
        album = new Album({
          eventId,
          name: albumName,
          description: `Auto-created album: ${albumName}`,
        });
        await album.save();
      }

      return album._id;
    } catch (error) {
      console.error(`Error finding/creating album: ${albumName}`, error);
      return null;
    }
  }

  /**
   * Auto-Assign Album
   * --------------------
   * Determines which album a media file should belong to.
   */
  static async determineAlbum(eventId, createdAt) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const eventDate = new Date(event.date);
    const mediaDate = new Date(createdAt);

    // Select album based on date
    if (mediaDate < eventDate) {
      return Album.findOne({ eventId, name: 'Behind the Scenes' });
    } else {
      return Album.findOne({ eventId, name: 'Main Event' });
    }
  }

  /**
   * Download Media (with Permission Check)
   * --------------------
   * Ensures guests can only download if the event host allows it.
   */
  static async downloadMedia(req, res) {
    try {
      const { mediaId } = req.params;
      const guestId = req.cookies?.guestId; // Guest ID from QR login
      const guestName = req.cookies?.guestName; // Optional guest name

      const media = await Media.findById(mediaId).populate('eventId');
      if (!media) return res.status(404).json({ error: 'Media not found' });

      const event = await Event.findById(media.eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      // Check if downloads are allowed
      if (!event.allowDownload) {
        return res.status(403).json({ error: 'Downloading is disabled for this event' });
      }

      // Track download
      await new DownloadLog({
        mediaId,
        guestId: guestId || null,
        guestName: guestName || 'Anonymous',
      }).save();

      // Retrieve file from GridFS
      const fileId = new mongoose.Types.ObjectId(media.fileId);
      const file = await bucket.find({ _id: fileId }).next();

      if (!file) return res.status(404).json({ error: 'File not found' });

      res.set({
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      });

      const downloadStream = bucket.openDownloadStream(fileId);
      downloadStream.on('error', () => res.status(500).end());
      downloadStream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Upload Media (with optional scheduled visibility & album sorting)
   * --------------------
   * Allows guests to upload photos/videos to an event.
   * Automatically assigns media to a default album if no album is provided.
   */
  static async uploadMedia(req, res) {
    const { eventId, visibleAt, albumId } = req.body;
    const file = req.file;

    if (!eventId || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      // Auto-categorize media if no

      let assignedAlbumId = albumId;

      // Auto-categorize media if no album is selected
      if (!albumId) {
        if (file.mimetype.startsWith('image/')) {
          assignedAlbumId = await MediaController.getOrCreateDefaultAlbum(eventId, 'Group Photos');
        } else if (file.mimetype.startsWith('video/')) {
          assignedAlbumId = await MediaController.getOrCreateDefaultAlbum(eventId, 'Videos');
        } else {
          assignedAlbumId = await MediaController.getOrCreateDefaultAlbum(eventId, 'Candid Moments');
        }
      }

      const filename = `${uuidv4()}-${file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
      });

      const media = new Media({
        eventId,
        albumId: assignedAlbumId,
        type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        filename,
        fileId: uploadStream.id,
        visibleAt: visibleAt ? new Date(visibleAt) : Date.now(),
      });

      uploadStream.on('finish', async () => {
        try {
          await media.save();
          await Event.findByIdAndUpdate(eventId, { $push: { media: media._id } });

          if (assignedAlbumId) {
            await Album.findByIdAndUpdate(assignedAlbumId, { $push: { media: media._id } });
          }

          getIO().to(eventId).emit('newMedia', media);

          const host = await User.findById(event.host);
          if (host) {
            await sendEmail(
              host.email,
              'New Media Uploaded to Your Event',
              `New ${media.type} uploaded to "${event.name}": ${process.env.FRONTEND_URL}/media/${media._id}`
            );
          }

          res.status(201).json({ message: 'Media uploaded successfully', media });
        } catch (error) {
          console.error('Post-upload error:', error);
          res.status(500).json({ error: 'Failed to finalize upload' });
        }
      });

      uploadStream.end(file.buffer);
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get Event Media (Only Visible Media)
   * --------------------
   * Returns only media that has passed its `visibleAt` time.
   */
  static async getEventMedia(req, res) {
    let { eventId } = req.params;

    try {
      // Trim spaces and extra quotes
      eventId = eventId.trim().replace(/"/g, '');

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID format' });
      }

      const now = new Date();

      // Only return media where `visibleAt` has passed
      const media = await Media.find({ eventId, visibleAt: { $lte: now } }).sort({ createdAt: -1 });

      res.status(200).json(media);
    } catch (error) {
      console.error('Error fetching media:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  /**
   * Approve Media (Host Only)
   * --------------------
   * Hosts can manually approve media.
   */
  static async approveMedia(req, res) {
    const { mediaId } = req.params;

    try {
      const media = await Media.findByIdAndUpdate(mediaId, { status: 'approved' }, { new: true });

      if (!media) return res.status(404).json({ error: 'Media not found' });

      res.status(200).json({ message: 'Media approved successfully', media });
    } catch (error) {
      console.error('Error approving media:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get Live Media (Show Latest Uploads)
   * --------------------
   * Retrieves the latest 10 uploaded media items for an event.
   */
  static async getLiveMedia(req, res) {
    const { eventId } = req.params;

    try {
      const media = await Media.find({ eventId })
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json(media);
    } catch (error) {
      console.error('Error fetching live media:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Update Media Visibility Time (Host Only)
   * --------------------
   * Allows the event host to manually change when media becomes visible.
   */
  static async updateMediaVisibility(req, res) {
    const { mediaId } = req.params;
    const { visibleAt } = req.body;

    if (!visibleAt) return res.status(400).json({ error: 'New visibility time required' });

    try {
      const media = await Media.findByIdAndUpdate(
        mediaId,
        { visibleAt: new Date(visibleAt) },
        { new: true }
      );

      if (!media) return res.status(404).json({ error: 'Media not found' });

      res.status(200).json({ message: 'Media visibility updated', media });
    } catch (error) {
      console.error('Error updating visibility:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }



  /**
   * Get Host Media
   * --------------------
   * Fetches all media uploaded by the host.
   */
  static async getHostMedia(req, res) {
    const hostId = req.user.id;

    try {
      const media = await Media.find({ hostId });
      if (!media || media.length === 0) {
        return res.status(404).json({ error: 'No media found for this host' });
      }
      res.status(200).json(media);
    } catch (error) {
      console.error('Error fetching host media:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  /**
   * Guest Upload Media (With Guest Token)
   * --------------------
   * Allows guests to upload media without needing an account.
   * Tracks uploads using a guest token stored in cookies.
   */
  static async guestUploadMedia(req, res) {
    try {
      let guestToken = req.cookies?.guestToken || req.body?.guestToken || null;
      const { eventId, guestName, guestEmail } = req.body || {};
      const file = req.file;

      if (!eventId || !file) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      let guest = guestToken ? await Guest.findOne({ guestToken }) : null;

      // If guest does not exist, create a new guest entry
      if (!guest) {
        guestToken = uuidv4();
        guest = new Guest({
          eventId,
          guestToken,
          name: guestName || 'Anonymous',
          email: guestEmail || '',
        });

        await guest.save();

        // Store guest token in a cookie for future uploads
        res.cookie('guestToken', guestToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      }

      const filename = `${uuidv4()}-${file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
      });

      const media = new Media({
        eventId,
        guestId: guest._id, // ✅ Ensure guest ID is assigned
        type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        filename,
        fileId: uploadStream.id,
      });

      uploadStream.on('finish', async () => {
        try {
          await media.save();
          await Event.findByIdAndUpdate(eventId, { $push: { media: media._id } });

          // ✅ Fetch media again to ensure guestId is included in the response
          const savedMedia = await Media.findById(media._id).lean();

          res.status(201).json({ message: 'Media uploaded successfully', media: savedMedia });
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

  /**
   * Download All Media for an Event
   * --------------------
   * Allows hosts to download all media in a ZIP file before event deletion.
   */   


  static async downloadAllMedia(req, res) {
      try {
          const { eventId } = req.params;
          const event = await Event.findById(eventId).populate('media');

          if (!event) return res.status(404).json({ error: 'Event not found' });

          const zipFilePath = path.join(__dirname, `../downloads/event_${eventId}.zip`);
          const output = fs.createWriteStream(zipFilePath);
          const archive = archiver('zip');

          archive.pipe(output);

          for (const media of event.media) {
              const filePath = `/path/to/gridfs/${media.fileId}`; // Replace with actual GridFS retrieval logic
              archive.append(fs.createReadStream(filePath), { name: media.filename });
          }

          await archive.finalize();

          res.download(zipFilePath, `event_${eventId}.zip`, () => {
              fs.unlinkSync(zipFilePath);
          });
      } catch (error) {
          console.error('Download error:', error);
          res.status(500).json({ error: 'Failed to download media' });
      }
  }
  
}
export default MediaController;
