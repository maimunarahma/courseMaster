import { Course } from "../models/course.model"

import { Request, Response } from "express";
const allCourses= async (req : Request, res : Response) => {
    try {
        const courses = await Course.find();
       return res.status(200).json(courses);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const courseById= async (req : Request, res : Response) => {
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

export const courseController={ allCourses , courseById}