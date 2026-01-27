import { Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { Enrollment } from "../models/enrollment.model";
import { Course } from "../models/course.model";

/**
 * Track video watch progress for a lesson
 * Updates watched duration and marks as completed if watched >= 80% of video
 * 
 * POST /api/enroll/track-progress
 * Body: { courseId, lessonId, watchedDuration }
 */
export const trackVideoProgress = async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId, watchedDuration } = req.body;
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const userData = verifyToken(token, "secretrefresh") as { userId: string };
    const userId = userData.userId;

    // Validate inputs
    if (!courseId || !lessonId || watchedDuration === undefined) {
      return res.status(400).json({ 
        message: "courseId, lessonId, and watchedDuration are required" 
      });
    }

    // Get course to find lesson duration
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the lesson in the course
    const lesson = course.lessons.find(l => l._id?.toString() === lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found in course" });
    }

    const lessonDuration = lesson.duration || 0;
    
    // Consider lesson completed if watched >= 80% of video
    const completionThreshold = lessonDuration * 0.8;
    const isCompleted = watchedDuration >= completionThreshold;

    // Find enrollment
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Update or add lesson progress
    const existingProgressIndex = enrollment.lessonProgress.findIndex(
      (lp: any) => lp.lessonId.toString() === lessonId
    );

    if (existingProgressIndex >= 0) {
      // Update existing progress
      enrollment.lessonProgress[existingProgressIndex].watchedDuration = watchedDuration;
      enrollment.lessonProgress[existingProgressIndex].isCompleted = isCompleted;
      enrollment.lessonProgress[existingProgressIndex].lastWatchedAt = new Date();
    } else {
      // Add new lesson progress
      enrollment.lessonProgress.push({
        lessonId,
        watchedDuration,
        isCompleted,
        lastWatchedAt: new Date()
      });
    }

    // Update lessonsCompleted array
    if (isCompleted && !enrollment.lessonsCompleted.includes(lessonId)) {
      enrollment.lessonsCompleted.push(lessonId);
    } else if (!isCompleted && enrollment.lessonsCompleted.includes(lessonId)) {
      enrollment.lessonsCompleted = enrollment.lessonsCompleted.filter(
        id => id.toString() !== lessonId
      );
    }

    // Calculate overall progress: (completed lessons / total lessons) * 100
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment.lessonsCompleted.length;
    enrollment.progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: "Video progress tracked successfully",
      data: {
        lessonCompleted: isCompleted,
        overallProgress: enrollment.progress,
        completedLessons,
        totalLessons,
        watchedDuration,
        lessonDuration
      }
    });

  } catch (error) {
    console.error("Track video progress error:", error);
    return res.status(500).json({ 
      message: "Error tracking video progress",
      error: (error as Error).message 
    });
  }
};

/**
 * Get student's progress for a specific course
 * Returns watched videos, total videos, and percentage
 * 
 * GET /api/enroll/progress/:id
 */
export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const userData = verifyToken(token, "secretrefresh") as { userId: string };
    const userId = userData.userId;

    // Get enrollment with progress
    const enrollment = await Enrollment.findOne({ 
      user: userId, 
      course: courseId 
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const totalVideos = course.lessons.length;
    const watchedVideos = enrollment.lessonsCompleted.length;
    const progressPercentage = enrollment.progress;

    // Calculate total watch time
    const totalWatchTime = enrollment.lessonProgress.reduce(
      (sum: number, lp: any) => sum + (lp.watchedDuration || 0), 
      0
    );

    // Calculate total course duration
    const totalCourseDuration = course.lessons.reduce(
      (sum: number, lesson: any) => sum + (lesson.duration || 0), 
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        courseId,
        totalVideos,
        watchedVideos,
        remainingVideos: totalVideos - watchedVideos,
        progressPercentage,
        totalWatchTime, // in seconds
        totalCourseDuration, // in seconds
        watchTimePercentage: totalCourseDuration > 0 
          ? Math.round((totalWatchTime / totalCourseDuration) * 100) 
          : 0,
        lessonProgress: enrollment.lessonProgress,
        lastUpdated: enrollment.updatedAt
      }
    });

  } catch (error) {
    console.error("Get student progress error:", error);
    return res.status(500).json({ 
      message: "Error fetching student progress",
      error: (error as Error).message 
    });
  }
};
