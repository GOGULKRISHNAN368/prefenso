import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
}

export async function closeDatabase(): Promise<void> {
  await mongoose.connection.close();
}
