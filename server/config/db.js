const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ CRITICAL DB ERROR: MONGO_URI is not defined in environment variables!');
    console.error('👉 Fix: Go to Render Dashboard -> Environment Variables and add MONGO_URI.');
    throw new Error('MONGO_URI is missing');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failure: ${error.message}`);
    if (
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('querySrv ENOTFOUND') ||
      error.message.includes('MongoServerSelectionError') ||
      error.message.includes('connect ECONNREFUSED')
    ) {
      console.error('👉 Atlas IP Restriction Hint: In MongoDB Atlas -> Network Access -> Add IP Address: 0.0.0.0/0 (Allow access from anywhere for Render).');
    }
    throw error;
  }
};

module.exports = connectDB;


