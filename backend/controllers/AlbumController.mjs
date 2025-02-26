import Album from '../models/Album.mjs';
import Event from '../models/Event.mjs';

class AlbumController {
  static async createAlbum(req, res) {
    const { eventId } = req.params;
    const { name, description, visibility } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Album name is required' });
    }

    try {
      const album = new Album({ eventId, name, description, visibility });
      await album.save();

      await Event.findByIdAndUpdate(eventId, { $push: { albums: album._id } });

      res.status(201).json({ message: 'Album created successfully', album });
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
}

export default AlbumController;
