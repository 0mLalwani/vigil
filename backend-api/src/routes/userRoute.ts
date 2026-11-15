import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import getUsers from "../controllers/userController";

export const userRouter = Router();

userRouter.get("/", authMiddleware, getUsers); // GET /api/users/
