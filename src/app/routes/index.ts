import { Router } from "express";
import { userRoutes } from "./user.route";
import { AuthRoutes } from "./auth.route";
import { courseRoutes } from "./course.route";
import { enrollRoutes } from "./enroll.route";
import { quizRoutes } from "./quiz.route";
import { assignmentRoutes } from "./assignment.route";


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
     }
]

moduleROutes.forEach((route)=>{
     router.use(route.path, route.route)
})