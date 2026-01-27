import mongoose from "mongoose";
   
// Schema for tracking individual lesson watch progress
const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  watchedDuration: { type: Number, default: 0 }, // Seconds watched
  isCompleted: { type: Boolean, default: false },
  lastWatchedAt: { type: Date, default: Date.now }
}, { _id: false });

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" , required: true},
  
  lessonsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  lessonProgress: [lessonProgressSchema], // Track watch progress per lesson
  progress: { type: Number, default: 0 } // Overall progress percentage (0-100)
}, { timestamps: true });

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
