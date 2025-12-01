import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, index: "text" },
  description: String,
  instructor: { type: String, required: true },
  category: { type: String, index: true },
  price: Number,
  thumbnail: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" }
}, { timestamps: true });

courseSchema.index({ title: "text", instructor: "text" });

export const Course = mongoose.model("Course", courseSchema);
