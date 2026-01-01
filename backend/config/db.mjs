import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

class DBClient {
  constructor() {
    this.mongod = null;
    this.connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/momentvibe';
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(this.connectionString, { serverSelectionTimeoutMS: 5000 });
      console.log('Successfully connected to the database');
    } catch (error) {
      console.warn('Primary MongoDB connection failed. Falling back to in-memory MongoDB for dev.');
      console.error('Connection error:', error.message || error);
      try {
        // Try to create an in-memory MongoDB. Some host/platform/version combos
        // don't have prebuilt binaries available at the precise URL mongodb-memory-server
        // tries to download. To improve reliability we try a small list of candidate
        // versions (and you can override with MONGOMS_VERSION env var).
        const preferred = process.env.MONGOMS_VERSION;
        const candidates = preferred
          ? [preferred]
          : [
              // reasonable defaults to try (adjust if needed)
              '6.0.12',
              '6.0.9',
              '6.0.8',
              '5.0.15',
            ];

        let started = false;
        for (const v of candidates) {
          try {
            console.log(`Attempting mongodb-memory-server binary version: ${v}`);
            this.mongod = await MongoMemoryServer.create({
              binary: { version: v },
              instance: { dbName: 'momentvibe-test' },
            });
            this.connectionString = this.mongod.getUri();
            await mongoose.connect(this.connectionString);
            console.log('Connected to in-memory MongoDB (mongodb-memory-server)', v);
            started = true;
            break;
          } catch (e) {
            console.warn(`mongodb-memory-server failed for version ${v}:`, e.message || e);
            // try next candidate
          }
        }

        if (!started) {
          console.error('Failed to start in-memory MongoDB with any tested binary versions.');
          console.warn('⚠️  Database operations will fail until MongoDB is available\n');
        }
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB', memErr.message || memErr);
        // Don't exit - let the app show clear errors when DB operations are attempted
        console.warn('⚠️  Database operations will fail until MongoDB is available\n');
      }
    }
  }

  async eventsCollection() {
    if (!this.isAlive()) {
      throw new Error('Database is not connected. Please ensure MongoDB is running or configure MONGO_URI in .env');
    }
    return mongoose.connection.collection('events');
  }

  async usersCollection() {
    if (!this.isAlive()) {
      throw new Error('Database is not connected. Please ensure MongoDB is running or configure MONGO_URI in .env');
    }
    return mongoose.connection.collection('users');
  }

  isAlive() {
    return mongoose.connection.readyState === 1;
  }

  async stopMemoryServer() {
    if (this.mongod) {
      await mongoose.disconnect();
      await this.mongod.stop();
      this.mongod = null;
      console.log('Stopped in-memory MongoDB');
    }
  }
}

const dbClient = new DBClient();
export default dbClient;