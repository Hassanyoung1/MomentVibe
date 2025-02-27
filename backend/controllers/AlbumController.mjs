import Album from '../models/Album.mjs';
import Event from '../models/Event.mjs';
import Media from  '../models/Media.mjs'
import mongoose from 'mongoose';

class AlbumController {
 static async createAlbum(req, res) {
    const { eventId, name, description } = req.body;

    // ✅ Validate if eventId and name are provided
    if (!eventId || !name) {
      return res.status(400).json({ error: 'Event ID and album name are required.' });
    }

    // ✅ Ensure eventId is a valid MongoDB ObjectId
    if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid eventId format.' });
    }

    try {
      const eventExists = await Event.findById(eventId);
      if (!eventExists) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const newAlbum = new Album({
        eventId,
        name,
        description: description || '',
      });

      await newAlbum.save();
      res.status(201).json({ message: 'Album created successfully', album: newAlbum });
    } catch (error) {
      console.error('Error creating album:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  static async getAlbumsByEvent(req, res) {
    const { eventId } = req.params;

    try {
      const albums = await Album.find({ eventId }).populate('media');
      res.status(200).json(albums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateAlbum(req, res) {
    const { albumId } = req.params;
    const { name, description, visibility } = req.body;

    try {
      const album = await Album.findByIdAndUpdate(
        albumId,
        { name, description, visibility },
        { new: true }
      );

      if (!album) {
        return res.status(404).json({ error: 'Album not found' });
      }

      res.status(200).json({ message: 'Album updated successfully', album });
    } catch (error) {
      console.error('Error updating album:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteAlbum(req, res) {
    const { albumId } = req.params;

    try {
      const album = await Album.findByIdAndDelete(albumId);

      if (!album) {
        return res.status(404).json({ error: 'Album not found' });
      }

      res.status(200).json({ message: 'Album deleted successfully' });
    } catch (error) {
      console.error('Error deleting album:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Move Media to Another Album
   * --------------------
   * Allows hosts to manually reassign media between albums.
   */ 
  static async moveMedia(req, res) {
    const { mediaId, newAlbumId } = req.body;

    // ✅ Validate if both IDs are proper MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({ error: 'Invalid mediaId. Must be a valid MongoDB ObjectId.' });
    }
    if (!mongoose.Types.ObjectId.isValid(newAlbumId)) {
      return res.status(400).json({ error: 'Invalid newAlbumId. Must be a valid MongoDB ObjectId.' });
    }

    try {
      const media = await Media.findById(mediaId);
      if (!media) return res.status(404).json({ error: 'Media not found' });

      // Remove from old album
      if (media.albumId) {
        await Album.findByIdAndUpdate(media.albumId, { $pull: { media: mediaId } });
      }

      // Add to new album
      await Album.findByIdAndUpdate(newAlbumId, { $push: { media: mediaId } });

      media.albumId = newAlbumId;
      await media.save();

      res.status(200).json({ message: 'Media moved successfully', media });
    } catch (error) {
      console.error('Error moving media:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AlbumController;
