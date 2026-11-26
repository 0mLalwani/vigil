import { verifyToken } from "@clerk/express";
import type { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { ChatModel } from "../models/Chat";
import { MessageModel } from "../models/Message";
import { UserModel } from "../models/User";

//userId -> socketId
const onlineUsers = new Map<string, Set<string>>();

export const initializeSocket = (httpServer: Server) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
    },
  });
  //auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    //clerk auth
    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const clerkId = session.sub;

      const user = await UserModel.findOne({ clerkId });
      if (!user) {
        return next(new Error("No user found"));
      }
      //attach user obj from db to socket data
      socket.data.user = user;
      //BRUH
      next();
    } catch (err) {
      console.error("Socket auth failed:", err);
      return next(new Error("Authentication error"));
    }
  });

  //user connects to app
  io.on("connection", (socket) => {
    const userId = String(socket.data.user._id);
    console.log("socket connected: ", socket.id, userId);
    socket.emit("online-users", Array.from(onlineUsers.keys()));

    //in case of multiple sessions for a single user, so can store multiple socketIds for a single userId
    const socketIds = onlineUsers.get(userId) ?? new Set<string>();
    socketIds.add(socket.id);
    onlineUsers.set(userId, socketIds);
    socket.broadcast.emit("new-user-connected", userId);

    //userId is a mongoose objectId; needs to be string for later comparisons "io.in" etc.
    socket.join(userId);

    //user clicks a chat room to join
    socket.on("join-room", async (roomId) => {
      try {
        const allowed = await ChatModel.exists({
          _id: roomId,
          participants: userId,
        });
        if (!allowed) {
          return socket.emit("error", "You are not allowed to join this room");
        }
        socket.join(roomId);
      } catch (err) {
        socket.emit("error", "Error joining room");
      }
    });
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
    });

    //user sends a message to a room
    socket.on("send-message", async ({ roomId, message }) => {
      console.log("send-message received", { roomId, message, userId });
      //save to db and emit to all users in the room
      try {
        //first try find the chat room and check if the user is a participant
        const chat = await ChatModel.findById(roomId);
        if (!chat) {
          return socket.emit("error", "Chat room not found");
        }
        if (!chat.participants.some((p) => p.toString() === userId)) {
          return socket.emit("error", "You are not a participant in this chat");
        }
        //finally create the message in db
        const newMessage = await MessageModel.create({
          chatId: roomId,
          senderId: userId,
          messageContent: message,
        });
        //save message in chat collection too
        chat.lastMessageId = newMessage._id;
        chat.lastMessageAt = newMessage.createdAt;
        await chat.save();

        await newMessage.populate("senderId", "name email avatar");

        for (const participantId of chat.participants) {
          io.in(String(participantId)).emit("new-message", newMessage);
        }
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    //VERY CONFUSING SYNTAX
    socket.on("typing", async ({ chatId, isTyping }) => {
      // socket.in(chatId).emit("typing", payload);
      try {
        const chat = await ChatModel.findById(chatId);
        if (!chat) return;
        const payload = {
          userId,
          chatId,
          isTyping,
        };
        for (const p of chat.participants) {
          if (p.toString() !== userId)
            io.in(p.toString()).emit("typing", payload);
        }
      } catch (err) {
        console.log("typing err", err);
      }
    });

    socket.on("disconnect", () => {
      const socketIds = onlineUsers.get(userId);
      if (!socketIds) return;

      //remove the leaving session from the set
      socketIds.delete(socket.id);
      if (socketIds.size === 0) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("user-disconnected", userId);
      }
    });
  });
  return io;
};
