import { Router } from "express";
import { userRoutes } from "./user.route";
import { AuthRoutes } from "./auth.route";
import { courseRoutes } from "./course.route";
import { enrollRoutes } from "./enroll.route";
import { quizRoutes } from "./quiz.route";
import { assignmentRoutes } from "./assignment.route";
import uploadRoutes from "./upload.route";


export const router=Router()
const moduleROutes= [
     {
        path:"/user",
        route: userRoutes
     },
     {
          path: "/auth",
          route: AuthRoutes
     },
     {
          path: "/courses",
          route: courseRoutes
     },
     {
          path : "/enroll",
           route: enrollRoutes
     },
      {
          path : "/quiz",
           route: quizRoutes
     }, 
     {
          path : "/assignment",
               route: assignmentRoutes
     },
     {
          path : "/upload",
               route: uploadRoutes
     }
]

moduleROutes.forEach((route)=>{
     router.use(route.path, route.route)
})

// Debug endpoint to inspect cookies and origin (temporary)
router.get('/debug/cookies', (req, res) => {
     try {
          return res.json({
               success: true,
               cookies: req.cookies,
               origin: req.headers.origin,
               headers: {
                    cookie: req.headers.cookie,
                    origin: req.headers.origin,
                    referer: req.headers.referer,
               },
          });
     } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
     }
});