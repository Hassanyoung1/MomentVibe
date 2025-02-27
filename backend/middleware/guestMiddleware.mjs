/**
 * Guest Token Middleware
 * --------------------
 * Checks if a guest has a token, generates one if not.
 */

import Guest from '../models/Guest.mjs';
import { v4 as uuidv4 } from 'uuid';

const guestMiddleware = async (req, res, next) => {
  let guestToken = req.cookies.guestToken;

  if (!guestToken) {
    // Generate a new guest token
    guestToken = uuidv4();
    res.cookie('guestToken', guestToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

    // Store guest in DB
    await new Guest({ eventId: req.query.eventId, guestToken }).save();
  }

  req.guestToken = guestToken;
  next();
};

export default guestMiddleware;
