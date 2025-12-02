import { Router } from "express";
import { userRoutes } from "./user.route";
import { AuthRoutes } from "./auth.route";
import { courseRoutes } from "./course.route";


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
     }
]

moduleROutes.forEach((route)=>{
     router.use(route.path, route.route)
})