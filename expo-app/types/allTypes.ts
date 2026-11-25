export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface MessageSender {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: MessageSender | string;
  messageContent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatLastMessage {
  _id: string;
  sender: MessageSender | string;
  messageContent: string;
  createdAt: Date;
}
export interface Chat {
  _id: string;
  participants: MessageSender[];
  lastMessage: ChatLastMessage | null;
  lastMessageAt: string;
  createdAt: Date;
}
