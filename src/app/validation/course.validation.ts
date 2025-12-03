import mongoose from "mongoose";
import { z } from "zod";


export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid ObjectId format",
});

export const courseValidationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  instructor: z.string().min(1),
  category: z.string().optional(),
  price: z.number().nonnegative().optional(),
  thumbnail: z.string().optional(),
  lessons: z.array(
    z.string().refine(id => mongoose.Types.ObjectId.isValid(id), "Invalid ObjectId")
  ).optional(),
  batch: z.string().refine(id => mongoose.Types.ObjectId.isValid(id), "Invalid ObjectId").optional()
});
