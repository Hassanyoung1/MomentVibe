import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

class DBClient {
  constructor() {
    this.mongod = null;
    this.connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/momentvibe';
    this.dbMode = (process.env.DB_MODE || 'auto').toLowerCase(); // 'auto' | 'atlas' | 'docker' | 'memory'
    this.mongooseOpts = {
      serverSelectionTimeoutMS: 15000,
    };
  }


  async tryConnect(uri, label = 'primary') {
    try {
      await mongoose.connect(uri, this.mongooseOpts);
      this.connectionString = uri;
      console.log(`Successfully connected to ${label} MongoDB (${uri})`);
      return true;
    } catch (err) {
      console.warn(`Failed to connect to ${label} MongoDB (${uri}):`, err.message || err);
      return false;
    }
  }

  async connect() {
    // Determine preferred flow based on DB_MODE and available env vars
    const candidates = [];
    if (this.dbMode === 'atlas' && process.env.MONGO_URI) {
      candidates.push({ uri: process.env.MONGO_URI, label: 'Atlas' });
    } else if (this.dbMode === 'docker') {
      candidates.push({ uri: 'mongodb://localhost:27017/momentvibe', label: 'Docker' });
    } else if (this.dbMode === 'memory') {
      // Force memory server only
    } else {
      // 'auto' mode: try MONGO_URI (if provided), then docker, then memory
      if (process.env.MONGO_URI) candidates.push({ uri: process.env.MONGO_URI, label: 'Atlas' });
      candidates.push({ uri: 'mongodb://localhost:27017/momentvibe', label: 'Docker' });
    }

    // Try each candidate URI with a couple of quick retries
    for (const c of candidates) {
      const ok = await this.tryConnect(c.uri, c.label);
      if (ok) return;
    }

    // Fall back to in-memory MongoDB for development if nothing else worked
    console.warn('All networked MongoDB connection attempts failed. Falling back to in-memory MongoDB for dev.');
    await this._startInMemory();
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

  async _startInMemory() {
    try {
      const preferred = process.env.MONGOMS_VERSION;
      const candidates = preferred
        ? [preferred]
        : [
          // Use MongoDB 6.x as 7.x removed ephemeralForTest storage engine
          '6.0.15',
          '6.0.14',
          '6.0.12',
        ];

      let started = false;
      for (const v of candidates) {
        try {
          console.log(`Attempting mongodb-memory-server binary version: ${v}`);
          this.mongod = await MongoMemoryServer.create({
            binary: {
              version: v,
            },
            instance: {
              dbName: 'momentvibe-test',
              args: ['--setParameter', 'diagnosticDataCollectionEnabled=false'],
            },
          });
          this.connectionString = this.mongod.getUri();
          await mongoose.connect(this.connectionString, this.mongooseOpts);
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

      // Cleanup handler so tests / dev don't leave the binary running
      const cleanup = async () => {
        if (this.mongod) {
          try {
            await mongoose.disconnect();
            await this.mongod.stop();
            this.mongod = null;
            console.log('Stopped in-memory MongoDB');
          } catch (e) {
            console.warn('Error during in-memory MongoDB shutdown', e.message || e);
          }
        }
      };

      process.once('SIGINT', cleanup);
      process.once('SIGTERM', cleanup);
      process.once('exit', cleanup);
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB', memErr.message || memErr);
      console.warn('⚠️  Database operations will fail until MongoDB is available\n');
    }
  }

  async stopMemoryServer() {
    if (this.mongod) {
      try {
        await mongoose.disconnect();
        await this.mongod.stop();
        this.mongod = null;
        console.log('Stopped in-memory MongoDB');
      } catch (e) {
        console.warn('Error stopping in-memory MongoDB', e.message || e);
      }
    }
  }

}

const dbClient = new DBClient();
export default dbClient;