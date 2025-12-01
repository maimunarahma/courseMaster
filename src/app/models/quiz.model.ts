import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number
  }]
});

export const Quiz = mongoose.model("Quiz", quizSchema);
