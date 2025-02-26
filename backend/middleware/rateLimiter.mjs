import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.mjs';

// Rate limiter for public uploads
export const publicUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit to 20 uploads per IP
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many uploads',
      message: 'Please try again later',
    });
  },
});

// Rate limiter for IP-based uploads
export const ipUploadLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args), // Use the correct Redis client method
    prefix: 'limiter_ip:', // Redis key prefix
  }),
  windowMs: 60 * 60 * 2000, // 1 hour
  max: 10, // Limit to 10 uploads per IP
  keyGenerator: (req) => req.ip, // Use IP address as the key
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many uploads',
      message: 'Please try again in an hour',
    });
  },
});