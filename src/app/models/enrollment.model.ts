import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" , required: true},
  
  lessonsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  progress: { type: Number, default: 0 }
}, { timestamps: true });

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
