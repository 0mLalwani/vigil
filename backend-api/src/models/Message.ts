//any actual message - id, chat_id (fkey), user_id(fkey clerk id), message type(text, media), msg_content, created_At

import mongoose from "mongoose";

interface Message {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  messageContent: String;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<Message>(
  {
    chatId: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageContent: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true },
);

//index on oldest->newest chatmessages id and creation date
messageSchema.index({ chatId: 1, createdAt: 1 });

export const MessageModel = mongoose.model("Message", messageSchema);
