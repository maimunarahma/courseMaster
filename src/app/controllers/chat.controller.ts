import { Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ChatSession } from "../models/chat.model";
import { Course } from "../models/course.model";
import { Enrollment } from "../models/enrollment.model";
import { callGemini } from "../../ai/geminiClient";
import { courseChatPrompt } from "../../ai/geminiTemplates";

/**
 * Chat with AI assistant about course topics
 * POST /api/chat/ask
 */
export const askCourseQuestion = async (req: Request, res: Response) => {
  try {
    const { courseId }= req.params
    const { message } = req.body;
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const userData = verifyToken(token, "secretrefresh") as { userId: string };
    const userId = userData.userId;

    // Validate input
    if (!courseId || !message?.trim()) {
      return res.status(400).json({ 
        message: "courseId and message are required" 
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ 
      user: userId, 
      course: courseId 
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: "You must be enrolled in this course to use the assistant" 
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get or create chat session
    let chatSession = await ChatSession.findOne({ 
      user: userId, 
      course: courseId 
    });

    if (!chatSession) {
      chatSession = await ChatSession.create({
        user: userId,
        course: courseId,
        messages: []
      });
    }

    // Prepare course context
    const courseObjectives = course.courseObjectives || [];
    const lessonTitles = course.lessons.map((l: any) => l.title).filter(Boolean);
    
    // Get recent chat history (last 5 messages for context)
    const recentHistory = chatSession.messages.slice(-5).map((m: any) => ({
      message: m.message,
      response: m.response
    }));

    // Generate AI response with course context
    const prompt = courseChatPrompt(
      course.title,
      course.description,
      course.courseLevel,
      courseObjectives,
      lessonTitles,
      recentHistory,
      message
    );

    const aiResponse = await callGemini(prompt);

    // Save message and response to chat history
    chatSession.messages.push({
      user: userId,
      course: courseId,
      message: message.trim(),
      response: aiResponse,
      timestamp: new Date()
    });

    await chatSession.save();

    return res.status(200).json({
      success: true,
      data: {
        message: message.trim(),
        response: aiResponse,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ 
      message: "Error processing your question",
      error: (error as Error).message 
    });
  }
};

/**
 * Get chat history for a course
 * GET /api/chat/history/:courseId
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const userData = verifyToken(token, "secretrefresh") as { userId: string };
    const userId = userData.userId;

    // Check enrollment
    const enrollment = await Enrollment.findOne({ 
      user: userId, 
      course: courseId 
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: "You must be enrolled in this course" 
      });
    }

    // Get chat session
    const chatSession = await ChatSession.findOne({ 
      user: userId, 
      course: courseId 
    }).populate('course', 'title');

    if (!chatSession) {
      return res.status(200).json({
        success: true,
        data: {
          messages: [],
          totalMessages: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        courseId,
        messages: chatSession.messages,
        totalMessages: chatSession.messages.length,
        lastUpdated: chatSession.updatedAt
      }
    });

  } catch (error) {
    console.error("Get chat history error:", error);
    return res.status(500).json({ 
      message: "Error fetching chat history",
      error: (error as Error).message 
    });
  }
};

/**
 * Clear chat history for a course
 * DELETE /api/chat/history/:courseId
 */
export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const userData = verifyToken(token, "secretrefresh") as { userId: string };
    const userId = userData.userId;

    const chatSession = await ChatSession.findOne({ 
      user: userId, 
      course: courseId 
    });

    if (chatSession) {
      chatSession.messages = [];
      await chatSession.save();
    }

    return res.status(200).json({
      success: true,
      message: "Chat history cleared successfully"
    });

  } catch (error) {
    console.error("Clear chat history error:", error);
    return res.status(500).json({ 
      message: "Error clearing chat history",
      error: (error as Error).message 
    });
  }
};
