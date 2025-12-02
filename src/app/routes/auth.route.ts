import { Router, type Request, type Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { userController } from "../controllers/user.controller";
import { authController } from "../controllers/auth.controller";

const router = Router();


router.post("/", authController.credentialLogin);
router.post('/logout', authController.logout)

export const AuthRoutes = router;