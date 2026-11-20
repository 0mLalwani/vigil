import { verifyToken } from "@clerk/express";
import type { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { UserModel } from "../models/User";
import { ChatModel } from "../models/Chat";
import { MessageModel } from "../models/Message";

//userId -> socketId
const onlineUsers = new Map<string, Set<string>>();

export const initializeSocket = (httpServer: Server) => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
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
            const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
            const clerkUserId = session.sub

            const user = UserModel.findOne({ clerkUserId });
            if (!user) {
                return next(new Error("No user found"));
            }
            //attach user obj from db to socket data
            socket.data.user = user;
        } catch (err) {
            return next(new Error("Authentication error"));
        }
    });

    //user connects to app
    io.on("connection", (socket) => {
        const userId = socket.data.user._id;
        socket.emit("online-users", Array.from(onlineUsers.keys()));

        //in case of multiple sessions for a single user, so can store multiple socketIds for a single userId
        const socketIds = onlineUsers.get(userId) ?? new Set<string>();
        socketIds.add(socket.id);
        onlineUsers.set(userId, socketIds);
        socket.broadcast.emit("new-user-connected", userId);

        //user clicks a chat room to join
        socket.on("join-room", async (roomId) => {
            try {
                const allowed = await ChatModel.exists({ _id: roomId, participants: userId });
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
        socket.on("send-message", async (roomId, message) => {
            //save to db and emit to all users in the room
            try {
                //first try find the chat room and check if the user is a participant
                const chat = await ChatModel.findById(roomId);
                if (!chat) {
                    return socket.emit("error", "Chat room not found");
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

                await newMessage.populate("senderId", "name avatar");

                for (const participantId of chat.participants) {
                    io.in(`user:${participantId}`).emit("new-message", newMessage);
                }
            } catch (err) {
                console.error("Error saving message:", err);
            }

        });
        socket.on("typing", () => { })

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