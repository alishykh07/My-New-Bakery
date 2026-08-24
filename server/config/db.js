import mongoose from 'mongoose';

let connectionPromise;

export async function connectDatabase() {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is required');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URL).catch(error => {
      connectionPromise = undefined;
      throw error;
    });
  }
  await connectionPromise;
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
