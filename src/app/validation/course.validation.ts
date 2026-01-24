import mongoose from "mongoose";
import { z } from "zod";


// 

const objectIdSchema = z.union([
  // Case 1: It's already a Mongoose ObjectId
  z.instanceof(mongoose.Types.ObjectId),
  
  // Case 2: It's a string that needs to be validated and converted
  z.string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid ObjectId format",
    })
    .transform((id) => new mongoose.Types.ObjectId(id)),
]);

export const courseValidationSchema = z.object({
  title: z.string().min(1, { message: "Title is required and cannot be empty" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required and category must be valid" }).optional(),
  courseLevel: z.string().min(1, { message: "Course level is required" }).optional(),
  courseDuration: z.string().min(1, { message: "Course duration is required" }).optional(),
  price: z.number().nonnegative({ message: "Price cannot be negative" }).optional(),
  thumbnail: z.string().optional(),
  instructorId: objectIdSchema,
  lessons: z.array(
    z.string().refine(id => mongoose.Types.ObjectId.isValid(id), "Invalid ObjectId")
  ).optional(),
  batch: z.string().refine(id => mongoose.Types.ObjectId.isValid(id), "Invalid ObjectId").optional()
});
