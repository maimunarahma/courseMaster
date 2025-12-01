import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  question: String,
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answer: String,
    driveLink: String,
    submittedAt: Date
  }]
});

export const Assignment = mongoose.model("Assignment", assignmentSchema);
