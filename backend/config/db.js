import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[DB] Connected to MongoDB Atlas/External at ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[DB] Failed to connect to specified MONGODB_URI: ${err.message}. Falling back to in-memory instance.`);
    }
  }

  // Fallback to in-memory MongoDB for smooth local testing
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[DB] Connected to in-memory MongoDB for local development: ${memUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[DB] Critical Error: Unable to initialize MongoDB: ${memErr.message}`);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
