import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:8080", "https://courseflow-platform.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1", router);

app.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to CourseMaster System" });
});

export default app;
