import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  title: { type: String, required: true },
  videoUrl: String,
  content: String,
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }
});

export const Lesson = mongoose.model("Lesson", lessonSchema);
