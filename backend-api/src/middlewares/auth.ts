import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { UserModel } from "../models/User";

export type AuthenticatedRequest = Request & { userId?: string };

/*
  1. gets auth cookies from ClerkProvider on frontend
  2. attaches userId to `req` object
*/
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isAuthenticated, userId: clerkId } = getAuth(req);
    if (!isAuthenticated) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const mongoUser = await UserModel.findOne({ clerkId });
    if (!mongoUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.userId = mongoUser._id.toString();
    next();
  } catch (err) {
    res.status(500);
    next(err);
  }
};
