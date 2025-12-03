import { Router, type Request, type Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { courseController } from "../controllers/course.controller";
import { Role } from "../models/user.model";
import { verifyToken } from "../utils/jwt";

const router = Router();

router.get("/", courseController.allCourses);
router.get("/:id", courseController.courseById);
router.post("/create", courseController.createCourse);
router.put("/edit/:id", courseController.updateCourse);
router.delete("/delete/:id", courseController.deleteCourse);



export const courseRoutes = router;