import { Course } from "../models/course.model"

import { Request, Response } from "express";
import { courseValidationSchema } from "../validation/course.validation";
import { verifyToken } from "../utils/jwt";
import { verifyRole } from "../../middlewares/verifyRole";
import { Role } from "../models/user.model";
import { Enrollment } from "../models/enrollment.model";
const allCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find();
        return res.status(200).json(courses);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const courseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json(course);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });

    }
}

const createCourse = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const userData = verifyToken(token, "secretrefresh") as { userId: string; email: string; role: string };
        console.log("user data", userData)
        if (verifyRole(userData.role, Role.INSTRUCTOR) === false && verifyRole(userData.role, Role.ADMIN) === false){
                    return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }

        const { title, description , category, courseDuration , courseLevel , courseOverview , price, thumbnail  } = req.body;
        console.log("course datas", title, description , category, courseDuration , courseLevel , courseOverview , price, thumbnail )
        const validateCourse = courseValidationSchema.parse({
            title,
            description,
            courseLevel,
            courseDuration,
            courseOverview,
            category,
            price,
            thumbnail
        })
        console.log("validate course", validateCourse)
        const newCourse = new Course(validateCourse);
        await newCourse.save();
        return res.status(201).json(newCourse);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const token = req.cookies.refreshToken

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const userData = verifyToken(token, "secretrefresh") as { userId: string; email: string; role: string };
         if (verifyRole(userData.role, Role.INSTRUCTOR) === false && verifyRole(userData.role, Role.ADMIN) === false) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }  
        const { title, description, instructor, category, price, thumbnail, lessons, batch } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                title,
                description,
                instructor,
                category,
                price,
                thumbnail,
                lessons,
                batch
            },
            { new: true }
        );
        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json(updatedCourse);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const token = req.cookies.refreshToken

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const userData = verifyToken(token, "secretrefresh") as { userId: string; email: string; role: string };
        if (verifyRole(userData.role, "admin") === false) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json({ message: "Course deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const courseController = { allCourses, courseById, createCourse, updateCourse, deleteCourse  }