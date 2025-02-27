import clamav from 'clamav.js';
import fs from "fs"

const virusScanner = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Use buffer instead of creating a read stream from a path
  clamav.ping(process.env.CLAMAV_PORT, process.env.CLAMAV_HOST, 1000, (err) => {
    if (err) {
      console.error('ClamAV not available:', err);
      return res.status(500).json({ error: 'Virus scanner not available' });
    }

    clamav.scan(req.file.buffer, process.env.CLAMAV_PORT, process.env.CLAMAV_HOST, (err, object, malicious) => {
      if (err) {
        console.error('Error scanning file:', err);
        return res.status(500).json({ error: 'Error scanning file' });
      }

      if (malicious) {
        console.log('File is malicious:', object);
        return res.status(400).json({ error: 'File is malicious' });
      }

      next();
    });
  });
};

export { virusScanner };