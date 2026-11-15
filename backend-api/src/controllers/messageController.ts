import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { ChatModel } from "../models/Chat";
import { MessageModel } from "../models/Message";

export async function getChatMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const mongoId = req.userId;
    const chatId = req.params.chatId;

    const chat = await ChatModel.findOne({
      _id: chatId,
      participants: mongoId,
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    const messages = await MessageModel.find({ chatId: chatId })
      .populate("senderId", "name email avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500);
    next(err);
  }
}
