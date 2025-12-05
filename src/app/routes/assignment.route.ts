import { Router, type Request, type Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { courseController } from "../controllers/course.controller";
import { Role } from "../models/user.model";
import { verifyToken } from "../utils/jwt";
import { assignmentController } from "../controllers/assignment.controller";

const router = Router();

// Create assignment (admin)
router.post("/:courseId", assignmentController.createAssignment);

// Submit assignment (student)
router.post("/:id/submit", assignmentController.submitAssignment);

// Get all submissions for an assignment (admin)
router.get("/:assignmentId/submissions", assignmentController.getAllSubmissions);

// Check/mark submission (admin)
router.patch("/:assignmentId/submissions/:submissionId", assignmentController.checkSubmission);

// Get my submissions (student)
router.get("/my-submissions", assignmentController.getMySubmissions);

export const assignmentRoutes = router;