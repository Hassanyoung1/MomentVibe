import express from 'express';
import dotenv from 'dotenv';
import dbClient from './config/db.mjs'; // Use .mjs extension
import { configureServer } from './config/server.mjs';
import { errorHandler } from './middleware/errorHandler.mjs'; // Use named import
import authRoutes from './routes/authRoutes.mjs'; // Import auth routes
import eventRoutes from './routes/eventRoutes.mjs'; // Import event routes
import { initSocket } from './config/socket.mjs';
import guestRoutes from './routes/guestRoutes.mjs';
import mediaRoutes from './routes/mediaRoutes.mjs';
import hostRoutes from './routes/hostRoutes.mjs';
import albumRoutes from './routes/albumRoutes.mjs'; // Import album routes
import guestbookRoutes from './routes/guestbookRoutes.mjs';


dotenv.config(); // Load environment variables

const app = express();

// Connect to MongoDB using the DBClient
dbClient.connect();

// Configure server (middleware, routes, etc.)
configureServer(app);

// Register routes
app.use('/api/auth', authRoutes); // Ensure this line is present
app.use('/api/events', eventRoutes); // Ensure this line is present
app.use('/api/guests', guestRoutes);
app.use('/api/media', mediaRoutes); // Ensure this line is present
app.use('/api/host', hostRoutes);
app.use('/api/albums', albumRoutes); // Register album routes

app.use('/api/guestbook', guestbookRoutes);

// Global error handler
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
initSocket(server); // Pass server instance to socket initialization