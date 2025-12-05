import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from './src/app';
import { connectDB } from './src/app/lib/db';
import 'dotenv/config';

let connected = false;

async function ensureDb() {
  if (connected) return;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }
  await connectDB(uri);
  connected = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDb();
  } catch (err: any) {
    console.error('DB connect error (Vercel):', err);
    res.status(500).json({ success: false, message: 'Database connection error', detail: err.message });
    return;
  }

  // Delegate handling to the Express app
  return app(req as any, res as any);
}
