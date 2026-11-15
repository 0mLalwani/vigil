import { Router } from "express";
import { authCallback, whoAmI } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth";

export const authRouter = Router();

authRouter.get("/me", authMiddleware, whoAmI);
authRouter.post("/callback", authCallback);
