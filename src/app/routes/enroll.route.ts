import { Router, type Request, type Response } from "express"
import { enrollmentController } from "../controllers/enrollment.controller";
import { trackVideoProgress, getStudentProgress } from "../controllers/progress.controller";

const router = Router();  


router.get("/", enrollmentController.getEnrolledCourses);
router.get("/:id", enrollmentController.getEnrolledCOurseByCourseId);
router.post("/:id", enrollmentController.enrollCourse);
router.get('/check/:id', enrollmentController.isEnrolled);
router.patch('/:id/progress', enrollmentController.progressCounter);

// Video progress tracking
router.post('/track-progress', trackVideoProgress);
router.get('/progress/:id', getStudentProgress);

export const enrollRoutes = router;