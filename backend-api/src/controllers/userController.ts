import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { UserModel } from "../models/User";

export default async function getUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const allUsers = await UserModel.find({ _id: { $ne: userId } }).select(
      "name email avatar",
    );
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500);
    next(err);
  }
}
