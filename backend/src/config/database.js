import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using the MONGODB_URI environment variable.
 * Exits the process on connection failure to prevent a broken-state server.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
}
