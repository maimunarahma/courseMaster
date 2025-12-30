import { Request, Response } from "express";
import Assignment from "../models/assignment.model";
import { verifyToken } from "../utils/jwt";
import mongoose from "mongoose";

// ========================
// Create Assignment (Admin)
// ========================
 const createAssignment = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params; // courseId from URL
    const { title, description, dueDate } = req.body;
 
    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      dueDate,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// Submit Assignment (Student)
// ========================
// ========================
const submitAssignment = async (req: Request, res: Response) => {
    // NOTE: For best practice, ensure 'verifyToken' and 'Assignment' are imported.
    // Also, use a centralized error handler instead of try-catch in every controller.
    
    try {
        // --- 1. Validate Input and Authorization ---
        // 'id' is confirmed to be the Course ID
        const { id } = req.params; 
        const { documentLink } = req.body;
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: Refresh token is missing" });
        }
        if (!documentLink) {
            return res.status(400).json({ success: false, message: "Bad Request: documentLink is required in the body" });
        }

        // Token verification and student ID extraction
        const userData = verifyToken(token, "secretrefresh") as { userId: string };
        const studentId = new mongoose.Types.ObjectId(userData.userId);
        // Use the param as the Course ID for the query
        const courseIdParam = new mongoose.Types.ObjectId(id);

        // --- 2. Check for Duplicate Submission ---
        // Find the assignment by Course ID AND check if this student has already submitted
        const existingSubmission = await Assignment.findOne({
            courseId: courseIdParam, // Find assignment associated with this course
            "submissions.studentId": studentId, // Check if the student's ID is already in the submissions array
        });

        if (existingSubmission) {
            // Prevent duplicate submissions
            return res.status(409).json({ success: false, message: "Assignment already submitted by this student." });
        }


        // --- 3. Push the new submission into the submissions array ---
        // CRITICAL FIX: The query now uses the Course ID to find the correct Assignment document.
        const assignment = await Assignment.findOneAndUpdate(
            { courseId: courseIdParam }, // FIND by Course ID
            {
                $push: {
                    submissions: {
                        studentId,
                        documentLink,
                        checked: false,
                        submittedAt: new Date(),
                    },
                },
            },
            { new: true } // return updated doc
        );

        if (!assignment) {
            // This 404 is triggered if no Assignment document exists for the given Course ID.
            return res.status(404).json({ success: false, message: "Assignment not found for the provided Course ID" });
        }

        // --- 4. Success Response ---
      return  res.status(200).json({ success: true, message: "Assignment submitted successfully.", data: assignment });
    } catch (error: any) {
        console.error("Submission Error:", error.message);
        // Handle Mongoose/JWT errors more gracefully
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
             return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token." });
        }
        // Handle CastError (e.g., if 'id' is not a valid ObjectId format)
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ success: false, message: "Bad Request: Invalid ID format provided." });
        }
        res.status(500).json({ success: false, message: "Server error during submission." });
    }
};


// ========================
// Get All Submissions (Admin)
// ========================
 const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
      .populate("submissions.studentId", "name email");

    if (!assignment)
      return res.status(404).json({ success: false, message: "Assignment not found" });

    res.json({ success: true, data: assignment.submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// Check / Mark Submission (Admin)
// ========================
 const checkSubmission = async (req: Request, res: Response) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { checked, score } = req.body;

    const assignment = await Assignment.updateOne(
      { _id: assignmentId, "submissions._id": submissionId },
      { $set: { "submissions.$.checked": checked, "submissions.$.score": score } }
    );

    res.json({ success: true, message: "Submission updated", data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// Student View Submission Status
// ========================
 const getMySubmissions = async (req: Request, res: Response) => {
  try {
      const token= req.cookies.refreshToken
  if(!token){
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
      const userData = verifyToken(token, "secretrefresh") as { userId: string; email: string; role: string };
    const studentId = userData.userId;

    const assignments = await Assignment.find({ "submissions.studentId": studentId })
      .select("title submissions")
      .lean();

    const mySubmissions = assignments.map((assignment) => ({
      assignmentId: assignment._id,
      title: assignment.title,
      submission: assignment.submissions.find(
        (s: any) => s.studentId.toString() === studentId.toString()
      ),
    }));

    res.json({ success: true, data: mySubmissions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignmentController =  { createAssignment, submitAssignment, getAllSubmissions, checkSubmission, getMySubmissions }