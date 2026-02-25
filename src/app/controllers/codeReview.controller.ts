import { Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { Course } from "../models/course.model";
import { Enrollment } from "../models/enrollment.model";
import { callGemini } from "../../ai/geminiClient";
import { codeReviewPrompt } from "../../ai/geminiTemplates";

/**
 * Submit code for AI review
 * POST /api/code-review/submit
 */
export const submitCodeForReview = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params
    const { code, language, assignmentDescription } = req.body;
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const userData = verifyToken(token, "secretrefresh") as { userId: string };
    const userId = userData.userId;

    // Validate input
    if (!courseId || !code?.trim() || !language) {
      return res.status(400).json({ 
        message: "courseId, code, and language are required" 
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ 
      user: userId, 
      course: courseId 
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: "You must be enrolled in this course to submit code for review" 
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Generate AI code review
    const prompt = codeReviewPrompt(
      code.trim(),
      language,
      course.title,
      assignmentDescription
    );

    const reviewResponse = await callGemini(prompt);

    return res.status(200).json({
      success: true,
      data: {
        review: reviewResponse,
        courseTitle: course.title,
        language,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error("Code review error:", error);
    return res.status(500).json({ 
      message: "Error processing code review",
      error: (error as Error).message 
    });
  }
};

/**
 * Quick code review without course context
 * POST /api/code-review/quick
 */
export const quickCodeReview = async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Validate input
    if (!code?.trim() || !language) {
      return res.status(400).json({ 
        message: "code and language are required" 
      });
    }

    // Generate AI code review without course context
    const prompt = codeReviewPrompt(
      code.trim(),
      language,
      "General Programming",
      undefined
    );

    const reviewResponse = await callGemini(prompt);

    return res.status(200).json({
      success: true,
      data: {
        review: reviewResponse,
        language,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error("Quick code review error:", error);
    return res.status(500).json({ 
      message: "Error processing code review",
      error: (error as Error).message 
    });
  }
};
