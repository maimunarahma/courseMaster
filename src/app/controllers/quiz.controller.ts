import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Quiz } from '../models/quiz.model';
import { quizPrompt } from '../../ai/geminiTemplates';
import { callGemini } from '../../ai/geminiClient';
import { Course } from '../models/course.model';
import { Enrollment, Enrollment as enrollments } from '../models/enrollment.model';

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

    // Get single quiz for this course
    const quiz = await Quiz.findOne({ course: courseId });

    console.log(quiz);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "No quiz found" });
    }

    return res.status(200).json({
      success: true,
      data: quiz
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getQuizById = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    // Validate quizId
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, message: "Invalid quizId" });
    }

    // Get single quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    return res.status(200).json({
      success: true,
      data: quiz
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



const generateQuiz = async (req : Request, res : Response) => {
  try {
    const {courseId} = req.params;
    const title= await Course.findById(courseId).then(c=>c?.title || null);
    if(title===null){
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    console.log(title)
    // const { topic = title, difficulty= "medium" , count = 10 } 

    if (title===null ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: topic, difficulty, or count"
      });
    }

    const prompt = quizPrompt(title, "medium" ,  10);
    console.log("Calling Gemini with prompt for topic:", title);
    
    const aiResponse = await callGemini(prompt);
    console.log("AI Response received:", aiResponse);

    
    const quiz =await extractJSON(aiResponse);
  const quizzes=await Quiz.create({
      course: courseId,
      title: `Quiz on ${title}`,
      questions: quiz.questions

    });
     await quizzes.save();
   return res.json({
      success: true,
      quiz: quizzes
    });

  } catch (error: any) {
    console.error("Quiz generation error:", error);
   return res.status(500).json({
      success: false,
      message: error.message || "AI quiz generation failed"
    });
  }
};


export const quizController = { getQuizzesByCourse, getQuizById, generateQuiz };

