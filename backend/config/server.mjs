import cors from 'cors';
import express from 'express';

export const configureServer = (app) => {
  const raw = process.env.CORS_ORIGIN || '';
  const allowedOrigins = raw
    ? raw.split(',').map((s) => s.trim())
    : [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow non-browser requests (like curl, server-to-server) with no origin
        if (!origin) return callback(null, true);
        // In development, allow any localhost or local network origin
        if (
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('http://192.168.') ||
          origin.startsWith('http://172.')
        ) {
          return callback(null, true);
        }
        return callback(new Error('CORS origin not allowed'));
      },
      credentials: true,
      exposedHeaders: ['set-cookie', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};