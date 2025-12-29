import { Router, type Request, type Response } from "express"
import { enrollmentController } from "../controllers/enrollment.controller";
import { quizController } from "../controllers/quiz.controller";

const router = Router();  


router.get("/:courseId", quizController.getQuizzesByCourse)
router.post("/generate", quizController.generateQuiz)
// router.post("/submit", quizController.enrollCourse)

export const quizRoutes = router;