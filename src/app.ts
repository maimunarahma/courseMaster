
import cors from "cors"
import express,{Request , Response} from "express"

import cookieParser from"cookie-parser";
import { router } from "./app/routes";



const app=express()
app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin:[ "http://localhost:8080",
      "https://courseflow-platform.vercel.app"
    ],

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);


app.use("/api/v1",router)
app.get("/",async(req:Request, res:Response)=>{
      res.status(200).json({
         message:" welcome to courseMaster System"
      })
})


export default app;