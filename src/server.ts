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
      "mongodb://127.0.0.1:27017/courseMaster"
    //   mongodb://localhost:27017/
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
  
