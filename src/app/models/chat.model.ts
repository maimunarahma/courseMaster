import mongoose from "mongoose";

// Schema for course-specific chat messages
const chatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// Schema for chat sessions per student per course
const chatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  messages: [chatMessageSchema],
}, { timestamps: true });

chatSessionSchema.index({ user: 1, course: 1 }, { unique: true });

export const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
