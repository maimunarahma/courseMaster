import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Quiz } from '../models/quiz.model';
import { quizPrompt } from '../../ai/geminiTemplates';
import { callGemini } from '../../ai/geminiClient';

const extractJSON=(text : string)=> {
  // Remove ```json and ``` if present
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

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



const generateQuiz = async (req : Request, res : Response) => {
  try {
    const { topic, difficulty , count  } = req.body;

    if (!topic || !difficulty || !count) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: topic, difficulty, or count"
      });
    }

    const prompt = quizPrompt(topic, difficulty, count);
    console.log("Calling Gemini with prompt for topic:", topic);
    
    const aiResponse = await callGemini(prompt);
    console.log("AI Response received:", aiResponse);

    
    const quiz =await extractJSON(aiResponse);


    res.json({
      success: true,
      quiz
    });

  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "AI quiz generation failed"
    });
  }
};

export const quizController = { getQuizzesByCourse , generateQuiz };

