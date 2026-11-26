import { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { Chat, Message, MessageSender } from "../types/allTypes";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, string>;
  unreadChats: Set<string>;
  currentChat: string | null;
  queryClient: QueryClient | null;

  connect: (
    getToken: () => Promise<string | null>,
    queryClient: QueryClient,
  ) => void;
  disconnect: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (
    chatId: string,
    messageContent: string,
    currentUser: MessageSender,
  ) => boolean;
  sendTyping: (chatId: string, isTyping: boolean) => void;
}

export const useSocketStorage = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
  unreadChats: new Set(),
  currentChat: null,
  queryClient: null,

  connect: (getToken, queryClient) => {
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (!url) throw new Error("Set EXPO_PUBLIC_API_URL as .env variable");

    const { socket: existingSocket } = get();
    if (existingSocket) return;

    //create the socket
    const socket = io(url, {
      auth: (cb) => {
        getToken()
          .then((token) => cb({ token: token ?? "" }))
          .catch(() => cb({ token: "" }));
      },
    });
    set({ socket, queryClient });

    //special event by socketio
    socket.on("connect_error", (err) => {
      console.log("Socket connect_error event triggered: ", err.message);
    });
    socket.on("connect", () => {
      console.log("socket Connected to API! Socket id: ", socket.id);
      set({ socket, isConnected: true });
    });
    socket.on("disconnect", () => {
      console.log("socket disConnected to API! Socket id: ", socket.id);
      set({ isConnected: false });
    });
    socket.on("online-users", (userIds: string[]) => {
      console.log("Currently online users socket ids: ", userIds);
      set({ onlineUsers: new Set(userIds) });
    });
    socket.on("new-user-connected", (joinedUserId: string) => {
      console.log("New user connected, socket id: ", joinedUserId);
      set((state) => {
        return {
          onlineUsers: new Set([...state.onlineUsers, joinedUserId]),
        };
      });
    });
    socket.on("user-disconnected", (leftUserId: string) => {
      console.log("User disconnected, socket id: ", leftUserId);
      set((state) => {
        const newOnlineUsers = new Set(state.onlineUsers);
        newOnlineUsers.delete(leftUserId);
        return { onlineUsers: newOnlineUsers };
      });
    });
    socket.on("error", (errorMessage: string) => {
      console.error("Error message received on socket: ", errorMessage);
    });
    //VERY CONFUSING SYNTAX
    socket.on("new-message", (message: Message) => {
      //senderId is actually a whole populated sender object
      const senderId = message.senderId._id;
      const { currentChat } = get();
      /* 
        once message is saved in db, and we get this event
        then perhaps we will replace the optimistic message from the
        tanstack store, with the actual message 
    */
      //identified by chatid and messages querykey
      queryClient.setQueryData<Message[]>(
        ["messages", message.chatId],
        (old) => {
          if (!old) return [message];
          const filtered = old.filter(
            (msg) => !msg._id.startsWith("temp-message-"),
          );
          return [...filtered, message];
        },
      );
      //if user is NOT in the chat that the message came from & the message is NOT from user themselves
      if (currentChat !== message.chatId) {
        const chats = queryClient.getQueryData<Chat[]>(["chats"]);

        const chat = chats?.find((chat) => chat._id === message.chatId);
        if (chat?.participants[0] && senderId === chat.participants[0]._id) {
          set((state) => {
            return {
              unreadChats: new Set([...state.unreadChats, message.chatId]),
            };
          });
        }
      }
      set((state) => {
        const typingUsers = new Map(state.typingUsers);
        typingUsers.delete(message.chatId);
        return { typingUsers };
      });
    });
    socket.on(
      "typing",
      ({
        userId,
        chatId,
        isTyping,
      }: {
        userId: string;
        chatId: string;
        isTyping: boolean;
      }) => {
        set((state) => {
          const typingUsers = new Map(state.typingUsers);
          if (isTyping) {
            typingUsers.set(chatId, userId);
          } else {
            typingUsers.delete(chatId);
          }
          return { typingUsers };
        });
      },
    );
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      //reset state
      set({
        socket: null,
        isConnected: false,
        onlineUsers: new Set(),
        typingUsers: new Map(),
        unreadChats: new Set(),
        currentChat: null,
        queryClient: null,
      });
    }
  },
  joinChat: (chatId) => {
    const { socket } = get();
    set((state) => {
      const newUnreadChats = new Set(state.unreadChats);
      //remove the chat user clicks on from the store of unreads
      newUnreadChats.delete(chatId);
      return { currentChat: chatId, unreadChats: newUnreadChats };
    });

    if (socket?.connected) socket?.emit("join-room", chatId);
  },
  leaveChat: (chatId) => {
    const { socket } = get();
    set({ currentChat: null });
    if (socket?.connected) socket.emit("leave-room", chatId);
  },
  sendMessage: (chatId, messageContent, currentUser) => {
    const { socket, queryClient } = get();
    if (!socket?.connected || !queryClient) return false;

    const tempId = `temp-message-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempId,
      chatId: chatId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageContent,
      senderId: currentUser,
    };
    //update the tanstack store to include the new message
    queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
      if (!old) return [optimisticMessage];
      return [...old, optimisticMessage];
    });
    //also emit to the db saving socket
    socket.emit("send-message", { roomId: chatId, message: messageContent });
    //in case our optimistic update fails server side
    socket.once("error", (message: string) => {
      console.log("ERROR RECEIVED: ", message);
      queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
        if (!old) return [];
        return old.filter((msg) => msg._id !== optimisticMessage._id);
      });
    });
    return true;
  },
  sendTyping: (chatId, isTyping) => {
    const { socket } = get();
    if (socket?.connected) socket.emit("typing", { chatId, isTyping });
  },
}));
