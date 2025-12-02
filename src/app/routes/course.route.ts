import { Router, type Request, type Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { courseController } from "../controllers/course.controller";

const router = Router();

router.get("/", courseController.allCourses);
router.get("/:id", courseController.courseById);


export const courseRoutes = router;