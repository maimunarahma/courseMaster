import { Course } from "../models/course.model"

import { Request, Response } from "express";
import { courseValidationSchema } from "../validation/course.validation";
import { verifyToken } from "../utils/jwt";
import { verifyRole } from "../../middlewares/verifyRole";
import { Role } from "../models/user.model";
import { Enrollment } from "../models/enrollment.model";
import { z } from "zod";
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

        const { title, description , category, courseDuration , courseLevel  , price } = req.body;
        console.log("course datas", title, description , category, courseDuration , courseLevel ,  price  )
        const validateCourse = courseValidationSchema.safeParse({
             ...req.body,
            instructorId: userData.userId,

        })
        if (!validateCourse.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validateCourse.error.issues.map(err => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

        console.log("validate course", validateCourse)
        const newCourse = new Course(validateCourse.data);
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
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        
        const userData = verifyToken(token, "secretrefresh") as { userId: string; email: string; role: string };
        
        const isAdmin = verifyRole(userData.role, Role.ADMIN);
        const isInstructor = verifyRole(userData.role, Role.INSTRUCTOR);
        
        if (isAdmin!==true && isInstructor!==true) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }
        
        const courseToUpdate = await Course.findById(id);
        if (!courseToUpdate) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        // Instructors can only update their own courses, admins can update any
        if (isInstructor && !isAdmin && userData.userId !== courseToUpdate.instructorId?.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only update your own courses" });
        }
        
        // Build update object with only provided fields
        const updateData: any = {};
        
        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.category !== undefined) updateData.category = req.body.category;
        if (req.body.price !== undefined) updateData.price = req.body.price;
        if (req.body.thumbnail !== undefined) updateData.thumbnail = req.body.thumbnail;
        if (req.body.batch !== undefined) updateData.batch = req.body.batch;
        if (req.body.courseDuration !== undefined) updateData.courseDuration = req.body.courseDuration;
        if (req.body.courseLevel !== undefined) updateData.courseLevel = req.body.courseLevel;
        if (req.body.courseOverview !== undefined) updateData.courseOverview = req.body.courseOverview;
        if (req.body.courseRequirements !== undefined) updateData.courseRequirements = req.body.courseRequirements;
        if (req.body.courseObjectives !== undefined) updateData.courseObjectives = req.body.courseObjectives;
        
        // Handle lessons - append to existing array instead of replacing
        if (req.body.lessons !== undefined) {
            console.log("Raw lessons input:", JSON.stringify(req.body.lessons, null, 2));
            const newLessons = Array.isArray(req.body.lessons) ? req.body.lessons : [req.body.lessons];
            console.log("Processed lessons:", JSON.stringify(newLessons, null, 2));
            
            // Use $push to append new lessons to the existing array
            updateData.$push = { lessons: { $each: newLessons } };
        }
        
        console.log("Full update data:", JSON.stringify(updateData, null, 2));
        
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        console.log("Updated course result:", updatedCourse ? "Success" : "Failed");
        if (updatedCourse?.lessons) {
            console.log("Lessons saved:", JSON.stringify(updatedCourse.lessons, null, 2));
        }
        
        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse
        });

    } catch (error: any) {
        console.error("Update course error:", error);
        return res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message
        });
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