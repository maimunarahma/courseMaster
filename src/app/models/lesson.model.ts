import mongoose from "mongoose";

export const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  module: [{
    type: mongoose.Schema.Types.ObjectId,
    title: String,
    ref: "Module",
     videoUrl: String,
     assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
     quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }
  }],
 

});

export const Lesson = mongoose.model("Lesson", lessonSchema);
