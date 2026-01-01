
import { Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { Enrollment } from "../models/enrollment.model";


const getEnrolledCourses = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token){
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        
        const userData = verifyToken(token, "secretrefresh") as { userId: string; email: string; role: string };
        const userId = userData.userId;

        const enrolledRecords = await Enrollment.find({ user: userId }) 
            .populate({
                path: 'course'
            })
            .select('course createdAt')
            .exec(); 

        if (!enrolledRecords || enrolledRecords.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "User has no active enrolled courses.", 
                courses: [] 
            });
        }
        
        const courses = enrolledRecords.map(record => record.course);

        res.status(200).json( {
            success: true,
            message: "Enrolled courses retrieved successfully.",
            courses: courses,
            count: courses.length
        });
        
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return res.status(500).json({ 
            message: "An error occurred while retrieving enrolled courses.",
            error: (error as Error).message 
        });
    }
};

const getEnrolledCOurseByCourseId = async (req: Request, res: Response) => {
     try {
        const token = req.cookies.refreshToken;
        if (!token){
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const userData = verifyToken(token , "secretrefresh" )
        const userId = userData.userId;
        const courseId = req.params.id;
        const enrolledRecord = await Enrollment.findOne({ user: userId , course : courseId})
        if (!enrolledRecord) {
            return res.status(404).json({ message: "No enrollment record found for this course." });

     }
        return res.status(200).json({ success: true, data: enrolledRecord });
     
     
     
    }catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error fetching enrollment record." });
     }
    }

const enrollCourse = async (req: Request, res: Response) => {
    try {
        // 1. Get and Verify Token (Authentication)
        const token = req.cookies.refreshToken;
  console.log(token)
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        
        // Ensure your verifyToken utility returns the correct user structure
        const userData = verifyToken(token, "secretrefresh") as { userId: string; email: string; role: string };
        const userId = userData.userId;

        // 2. Get Course ID from Parameters
        // Use a more specific parameter name like 'courseId'
        const courseId = req.params.id; 
        
        if (!courseId) {
            return res.status(400).json({ message: "Bad Request: Course ID missing" });
        }

        // 3. Find and Update the User Document (Enrollment Logic)
        
        // Use $addToSet to add the courseId to the user's enrolledCourses array.
        // $addToSet ensures the course is not added twice.
      const isExist = await Enrollment.findOne({
    user: userId,   // The user's ID
    course: courseId // The course's ID
});
          
console.log(isExist)
if(isExist){
    return res.status(404).json({ message: "User already enrolled." });
}
        // Check if the user was found and updated
        if (!isExist) {
            const newEnrollment = await Enrollment.create({
            user: userId,
            course: courseId
        });
               res.status(200).json({ 
            success: true,
            message: "Course successfully enrolled!",
            enrolledCoursesCount: newEnrollment
        });
        }
  
     
        
    } catch (error) {
        console.error("Enrollment Error:", error);
        return res.status(500).json({ 
            message: "An error occurred during enrollment.",
            error: (error as Error).message 
        });
    }
};

// GET route to check enrollment status
const isEnrolled = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken;
        const userData = verifyToken(token, "secretrefresh") as { userId: string };
        const courseId = req.params.id;

        const isExist = await Enrollment.findOne({
            user: userData.userId,
            course: courseId
        });
        console.log("isEnrolledExist", isExist)
   if(isExist)
        return res.status(200).json({ isEnrolled: true });

    return res.status(200).json({ isEnrolled: false });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error checking enrollment" });
    }
}
  const progressCounter = async (req : Request, res : Response) => {
    try {
      const { courseId  } = req.params
      const token = req.cookies.refreshToken;
        const userData = verifyToken(token , process.env.JWT_REFRESH_SECRET as string) as { userId: string };
        const userId = userData.userId;
        
      const { progress} = req.body
      const enrollments = await Enrollment.findOne({ course: courseId, user: userId });
      if(!enrollments){
        return res.status(404).json({ success: false, message: "Enrollment not found" });
      }
      const newProgress =  await enrollments.updateOne( 
        { course: courseId, user: userId },
        { $inc: { progress } }
      );
      await enrollments.save();
      return res.status(200).json({ success: true, newProgress });


      
    } catch (error) {
       console.log(error)
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

  }
export const enrollmentController =  { getEnrolledCourses ,enrollCourse ,isEnrolled  , progressCounter};