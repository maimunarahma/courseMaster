import mongoose from "mongoose";
import { z } from "zod";


export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid ObjectId format",
});

export const courseValidationSchema = z.object({
  title: z.string().min(1, { message: "Title is required and cannot be empty" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }).optional(),
  courseLevel: z.string().min(1, { message: "Course level is required" }).optional(),
  courseDuration: z.string().min(1, { message: "Course duration is required" }).optional(),
  price: z.number({ invalid_type_error: "Price must be a number" }).nonnegative({ message: "Price cannot be negative" }).optional(),
  thumbnail: z.string().optional(),
  instructor: z.string().refine(id => mongoose.Types.ObjectId.isValid(id), "Invalid ObjectId"),
  lessons: z.array(
    z.string().refine(id => mongoose.Types.ObjectId.isValid(id), "Invalid ObjectId")
  ).optional(),
  batch: z.string().refine(id => mongoose.Types.ObjectId.isValid(id), "Invalid ObjectId").optional()
});
