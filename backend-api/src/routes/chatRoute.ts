import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { getAllChats, getChat } from "../controllers/chatController";

export const chatRouter = Router();

chatRouter.use(authMiddleware);
chatRouter.get("/", getAllChats); // GET /api/chat/
chatRouter.post("/:userId", getChat); //POST /api/chat/:userId
