import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { ChatModel } from "../models/Chat";
import { MessageModel } from "../models/Message";

export default async function getChatMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const mongoId = req.userId;
    const chatId = req.params.chatId;

    const chat = ChatModel.findOne({
      _id: { $eq: chatId },
      participants: mongoId, //but this is an array of 2+ users, how is this gonna be equal to just single mongoId
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    const messages = await MessageModel.find({ $eq: { chatId: chatId } });
    res.json(messages);
  } catch (err) {
    res.status(500);
    next(err);
  }
}
