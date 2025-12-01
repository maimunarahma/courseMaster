
import cors from "cors"
import express,{type Response,type Request, type NextFunction} from "express"

import cookieParser from"cookie-parser";
import { router } from "./app/routes";


const app=express()
app.use(cookieParser())
app.use(express.json())
app.use(cors())

app.use("/api/v1",router)
app.get("/",async(req:Request, res:Response)=>{
      res.status(200).json({
         message:" welcome to courseMaster System"
      })
})


export default app;