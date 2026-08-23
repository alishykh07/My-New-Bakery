import mongoose from 'mongoose';

export async function connectDatabase() {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is required');
  await mongoose.connect(process.env.MONGO_URL);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
