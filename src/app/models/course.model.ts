import mongoose from "mongoose";
import { fa } from "zod/v4/locales";



 enum Category{
    PROGRAMMING = "programming",
    DESIGN = "design",
    MARKETING = "marketing",
    BUSINESS = "business",
    PERSONAL_DEVELOPMENT = "personal_development",
    IT_AND_SOFTWARE = "it_and_software",
    HEALTH_AND_FITNESS = "health_and_fitness",
    MUSIC = "music",
    PHOTOGRAPHY = "photography",
    LANGUAGE = "language",
    ACADEMICS = "academics"
 }
  enum Level{
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
  }
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, index: "text" },
  description: String,
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref : "User"},
  category: { type: String, enum: Object.values(Category), index: true },
  price: Number,
  courseDuration: { type: Number, required: true }, 
  courseLevel: { type: String, enum: Object.values(Level), required: true },
  courseOverview: { type: String },
   courseRequirements: { type: [String] },
   courseObjectives: { type: [String] },
  thumbnail: { type: String, required: false},
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" , required: false}],
 
  batch: { type: Number, ref: "Batch" , required: false}
}, { timestamps: true });

courseSchema.index({ title: "text", instructor: "text" });

export const Course = mongoose.model("Course", courseSchema);
