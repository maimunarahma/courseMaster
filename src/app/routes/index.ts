import { Router } from "express";
import path from "path";
import { userRoutes } from "./user.route";


export const router=Router()
const moduleROutes= [
     {
        path:"/user",
        route: userRoutes
     }
]

moduleROutes.forEach((route)=>{
     router.use(route.path, route.route)
})