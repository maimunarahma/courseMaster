import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Quiz } from '../models/quiz.model';

const getQuizzesByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    console.log("courseId:", courseId);

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid courseId" });
    }

    // Get all quizzes for this course
    const quizes = await Quiz.find({ course: courseId });

    console.log(quizes);

    if (!quizes || quizes.length === 0) {
      return res.status(404).json({ success: false, message: "No quizzes found" });
    }

    return res.status(200).json({
      success: true,
      data: quizes
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const quizController = { getQuizzesByCourse };
