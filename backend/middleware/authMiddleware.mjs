import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.mjs';
import User from '../models/User.mjs';


const authMiddleware = (requiredRole) => async (req, res, next) => {
  const authHeader = req.header('Authorization');

  console.log('Received Authorization Header:', authHeader); // DEBUG LOG

  if (!authHeader) {
    console.log('No authorization header provided');
    return res.status(401).json({ error: 'Access denied. No authorization header provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Extracted Token:', token); // DEBUG LOG

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    console.log('Token Blacklist Check:', isBlacklisted); // DEBUG LOG

    if (isBlacklisted) {
      console.log('Token is blacklisted');
      return res.status(401).json({ error: 'Token is blacklisted' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // DEBUG LOG

    const user = await User.findById(decoded.userId);
    console.log('User Found:', user); // DEBUG LOG

    if (!user) {
      console.log('User not found');
      return res.status(403).json({ error: 'Access denied' });
    }

    if (requiredRole && user.role !== requiredRole) {
      console.log('User role does not match required role');
      return res.status(403).json({ error: 'Access denied' });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log('Invalid token:', err.message); // DEBUG LOG
    res.status(400).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;
