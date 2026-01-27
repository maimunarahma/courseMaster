import mongoose from "mongoose";

export const moduleSchema = new mongoose.Schema({
  title: { type: String },
  videoUrl: { type: String },
  duration: { type: Number }, // Duration in seconds
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }
}, { _id: true });


export const Module = mongoose.model("Module", moduleSchema);
