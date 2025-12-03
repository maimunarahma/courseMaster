import { Request, Response } from "express";
export const verifyRole = (userRole: string, requiredRole: string) => {
  if (userRole !== requiredRole) {
  return  false;
  

  }
};

