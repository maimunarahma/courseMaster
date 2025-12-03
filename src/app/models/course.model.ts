import mongoose from "mongoose";
import { fa } from "zod/v4/locales";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, index: "text" },
  description: String,
  instructor: { type: String, required: true },
  category: { type: String, index: true },
  price: Number,
  thumbnail: { type: String, required: false},
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" , required: false}],
 
  batch: { type: Number, ref: "Batch" , required: false}
}, { timestamps: true });

courseSchema.index({ title: "text", instructor: "text" });

export const Course = mongoose.model("Course", courseSchema);
