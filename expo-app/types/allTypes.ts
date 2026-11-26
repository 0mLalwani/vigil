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
  chatId: string;
  senderId: MessageSender;
  messageContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatLastMessage {
  _id: string;
  chatId: string;
  senderId: string;
  messageContent: string;
  createdAt: string;
}
export interface Chat {
  _id: string;
  participants: MessageSender[];
  lastMessageId: ChatLastMessage | null;
  lastMessageAt: string;
  createdAt: string;
}
