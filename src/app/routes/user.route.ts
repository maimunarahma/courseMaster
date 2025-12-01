import { Router, type Request, type Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  // TODO: implement registration logic
  res.status(201).json({ message: "user registered (stub)" });
});

router.get("/all-users", async (req: Request, res: Response) => {
  // TODO: fetch users from DB
  res.status(200).json({ users: [] });
});

export const userRoutes = router;