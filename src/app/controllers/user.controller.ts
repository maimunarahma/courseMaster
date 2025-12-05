import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { generateToken, verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken"

const registerUser = async (req : Request, res : Response) => {
    try {
        console.log("hi")
        const { name, email, password , role} = req.body;
        if(!name || !email || !password || !role)
        {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const isUserExist =  await User.findOne({
            email})
        if(isUserExist){
            return res.status(409).json({ message: "User already exists" });
        }

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });
        await newUser.save();
          const JwtPayload={
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role
     }
     const accessToken= generateToken(JwtPayload, "secret", "1d")
     const refreshToken= generateToken(JwtPayload, "secretrefresh", "30d")

   res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30*24*60*60*1000,
});

        return res.status(201).json({ message: "User registered successfully", user: {
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            accessToken,
            refreshToken
        } });
    }
     catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error", error });
    }
}

const validateUser=async(req:Request, res:Response)=>{
      try {
    // const userId = req.params.id; // set by authenticateToken middleware
    const refreshToken=req.cookies.refreshToken
    console.log(refreshToken)
      const verifiedRefreshToken = verifyToken(refreshToken, "secretrefresh") as JwtPayload
  console.log(verifiedRefreshToken)

    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email , _id: verifiedRefreshToken.userId })

    if (!isUserExist) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
   
    const user = await User.findById({_id: verifiedRefreshToken.userId});
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const userController = { registerUser ,validateUser };