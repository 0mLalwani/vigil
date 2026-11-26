//any chat room - chatroomid, participantid[clerkid []], last_message, last_message_ts,
import mongoose from "mongoose";

interface Chat {
  participants: mongoose.Types.ObjectId[];
  lastMessageId?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new mongoose.Schema<Chat>(
  {
    participants: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      ],
      required: true,
      validate: {
        validator(participant_arr) {
          return participant_arr.length >= 2;
        },
        message: "A chat must have atleast 2 participants.",
      },
    }, //array of ids that get their id value from the User collections _id
    lastMessageId: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const ChatModel = mongoose.model("Chat", chatSchema);
