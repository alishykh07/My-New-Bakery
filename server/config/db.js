// import mongoose from 'mongoose';

// export async function connectDatabase() {
//   if (!process.env.MONGO_URL) throw new Error('MONGO_URL is required');
//   await mongoose.connect(process.env.MONGO_URL);
//   console.log(`MongoDB connected: ${mongoose.connection.host}`);
// }


import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL is required');
  }

  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}