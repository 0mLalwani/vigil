import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { ChatModel } from "../models/Chat";
import { Types } from "mongoose";

//for the chat list
export async function getAllChats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const mongoId = req.userId;

    const chats = await ChatModel.find({ participants: mongoId })
      .populate("participants", "name email avatar")
      .populate("lastMessageId")
      .sort({ lastMessageAt: -1 });

    //remove user's own participant object from chat participants array
    const formattedChats = chats.map((chat) => {
      const chatObj = chat.toObject();
      chatObj.participants = chatObj.participants.filter((participant) => {
        return String(participant._id) !== String(req.userId);
      });
      return chatObj;
    });

    res.status(200).json(formattedChats);
  } catch (err) {
    res.status(500);
    next(err);
  }
}

export async function getChat(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const mongoId = req.userId;
    const { userId: otherParticipantid } = req.params;
    if (
      !otherParticipantid ||
      !Types.ObjectId.isValid(String(otherParticipantid))
    ) {
      res.status(404).json({
        message: "You must specify a valid userId for a chat participant",
      });
    }

    let newChat = await ChatModel.findOne({
      participants: { $all: [mongoId, otherParticipantid] },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessageId");
    if (!newChat) {
      newChat = new ChatModel({
        participants: [mongoId, otherParticipantid],
      });
      await newChat.save();
      newChat = await newChat.populate("participants", "name email avatar");
    }

    res.status(200).json(newChat);
    return;
  } catch (err) {
    res.status(500);
    next(err);
  }
}
