import { Router, type Request, type Response } from "express"
import { enrollmentController } from "../controllers/enrollment.controller";

const router = Router();  


router.get("/", enrollmentController.getEnrolledCourses);
router.post("/:id", enrollmentController.enrollCourse);

export const enrollRoutes = router;