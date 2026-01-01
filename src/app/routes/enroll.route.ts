import { Router, type Request, type Response } from "express"
import { enrollmentController } from "../controllers/enrollment.controller";

const router = Router();  


router.get("/", enrollmentController.getEnrolledCourses);
router.get("/:id", enrollmentController.getEnrolledCourses);
router.post("/:id", enrollmentController.enrollCourse);
router.get('/check/:id', enrollmentController.isEnrolled);
router.patch('/:id/progress', enrollmentController.progressCounter);

export const enrollRoutes = router;