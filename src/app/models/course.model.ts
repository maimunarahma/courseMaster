import mongoose from "mongoose";
import { fa } from "zod/v4/locales";
import { lessonSchema, moduleSchema } from "./lesson.model";



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
  description: { type:String, required: true , message : "Description is required" },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref : "User"},
  category: { type: String, enum: Object.values(Category), index: true , required: true , message : "Invalid category" },
  price: { type: Number, required: true , default: 0 , message : "Price is required and must be a positive number" },
  courseDuration: { type: Number, required: true  , message : "Course duration is required" }, 
  courseLevel: { type: String, enum: Object.values(Level), required: true , message : "Invalid level" },
  courseOverview: { type: String },
   courseRequirements: { type: [String] },
   courseObjectives: { type: [String] },
  thumbnail: { type: String, required: false},
  lessons: [moduleSchema],
 
  batch: { type: Number, ref: "Batch" , required: false}
}, { timestamps: true });

courseSchema.index({ title: "text", instructor: "text" });

export const Course = mongoose.model("Course", courseSchema);
