import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

let bucket;

// Initialize GridFSBucket
const initializeBucket = () => {
  const db = mongoose.connection.db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'media', // Custom bucket name
  });
};

// Wait for MongoDB connection to initialize the bucket
mongoose.connection.once('open', () => {
  initializeBucket();
});

export { bucket };