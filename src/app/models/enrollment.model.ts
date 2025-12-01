import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  lessonsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  progress: { type: Number, default: 0 }
}, { timestamps: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
