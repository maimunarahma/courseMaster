import express from "express";
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";

let server: Server;

const startServer = async () => {
  const MONGO_URI = process.env.MONGODB_URI || 
    'mongodb+srv://courseUser:p07lSW9UcZ6tkyX9@cluster0.2h2ve40.mongodb.net/courseMaster?appName=Cluster0';

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      // optional settings
      autoIndex: true,
      serverSelectionTimeoutMS: 10000, // fail fast if DB is unreachable
    });
    console.log("✅ Connected to MongoDB");

    // Start server only after DB connects
    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Optional: handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Closing server...");
      await mongoose.disconnect();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // exit if DB connection fails
  }
};

startServer();
