import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB disconnected');
};

export default { connectDB, disconnectDB };
