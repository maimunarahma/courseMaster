import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcryptjs";

interface LoginPayload {
  userId: string;
  email: string;
  role: string;
}

const credentialLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload: LoginPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(payload, process.env.JWT_SECRET || "secret", "1d");
    const refreshToken = generateToken(payload, process.env.JWT_REFRESH_SECRET || "secretrefresh", "30d");

    // Set refresh token cookie with proper configuration
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/", // Ensure cookie is available for all paths
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
    path: "/", // Must match the path used when setting the cookie
  };

  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({ message: "Logged out successfully" });
};

export const authController = { credentialLogin, logout };