import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { connectDB } from "./app/lib/db";
import 'dotenv/config';

let server: Server;

const startServer = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    await connectDB(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Closing server...");
      await mongoose.disconnect();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// Only start a listening server when NOT running on Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
} else {
  // In Vercel we expose the app via the serverless function at /api
  console.log('Running on Vercel - serverless mode, not starting HTTP listener');
}
