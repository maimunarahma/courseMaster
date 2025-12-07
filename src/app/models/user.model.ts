import mongoose from "mongoose";

export enum Role{
    STUDENT = "student",
    ADMIN = "admin"

}
export interface IUser{
  name: String,
  email: String;
  password: String,
  role : String
}
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), default: Role.STUDENT },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
