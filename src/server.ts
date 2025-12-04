import express from "express";
import { Server } from "http";
import mongoose from "mongoose";
// import { promise } from "zod";
import app from "./app";

let server: Server;
// const app = express();
const startServer = async () => {
  try {
    await mongoose.connect(
//  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2h2ve40.mongodb.net/?appName=cluster0`
'mongodb+srv://courseUser:p07lSW9UcZ6tkyX9@cluster0.2h2ve40.mongodb.net/courseMaster?appName=Cluster0'   
    );
    console.log("connected to db");
    server = app.listen(5000, () => {
      console.log("hello from courseMaster ");
    });
  } catch (error) {
    console.log(error);
  }
};
startServer()
  
