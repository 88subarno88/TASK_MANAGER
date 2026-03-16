import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m);
  }
  try { cached.conn = await cached.promise; }
  catch (e) { cached.promise = null; throw e; }
  return cached.conn;
}

export default connectDB;
