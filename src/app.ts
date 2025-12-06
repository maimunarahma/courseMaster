import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";


const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://course-master-frontend-mu.vercel.app",
  "https://courseflow-platform.vercel.app",
];
console.log("ENV:", process.env.NODE_ENV);


app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/v1", router);

// Base route
app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Welcome to CourseMaster System" });
});

export default app;
