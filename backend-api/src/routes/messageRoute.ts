import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { getChatMessages } from "../controllers/messageController";

export const messageRouter = Router();

messageRouter.get("/:chatId", authMiddleware, getChatMessages); // GET /api/message/:chatId
