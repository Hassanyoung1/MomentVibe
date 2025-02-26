import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    this.connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/momentvibe';
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(this.connectionString);
      console.log('Successfully connected to the database');
    } catch (error) {
      console.error('Error connecting to the database', error);
      process.exit(1);
    }
  }

  async eventsCollection() {
    return mongoose.connection.collection('events');
  }

  async usersCollection() {
    return mongoose.connection.collection('users');
  }

  isAlive() {
    return mongoose.connection.readyState === 1;
  }
}

const dbClient = new DBClient();
export default dbClient;