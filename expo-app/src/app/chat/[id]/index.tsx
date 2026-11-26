import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMessages } from "../../../../hooks/useMessages";
import { useUser } from "../../../../hooks/useUser";
import { useSocketStorage } from "../../../../lib/socket";

type ChatParams = {
  id: string;
  participantId: string;
  name: string;
  avatar: string;
};

export default function ChatPage() {
  const {
    id: chatId,
    participantId,
    name,
    avatar,
  } = useLocalSearchParams<ChatParams>();

  const [messageText, setMessageText] = useState("");
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: currentUser } = useUser();
  const { data: messages, isLoading } = useMessages(String(chatId));
  const {
    isConnected,
    onlineUsers,
    typingUsers,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
  } = useSocketStorage();

  const isOnline = Boolean(participantId && onlineUsers.has(participantId));
  const isTyping = typingUsers.get(chatId) === participantId;
  const canSend = messageText.trim().length > 0 && isConnected && !!currentUser;

  useEffect(() => {
    if (!chatId || !isConnected) return;
    joinChat(chatId);
    return () => leaveChat(chatId);
  }, [chatId, isConnected, joinChat, leaveChat]);

  useEffect(() => {
    if (!messages?.length) return;
    const id = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(id);
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleTyping = (text: string) => {
    setMessageText(text);
    if (!isConnected || !chatId) return;

    if (text.length === 0) {
      sendTyping(chatId, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }

    sendTyping(chatId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(chatId, false);
    }, 2000);
  };

  const handleSend = () => {
    const text = messageText.trim();
    if (!text || !currentUser) return;
    if (!sendMessage(chatId, text, currentUser)) return;

    setMessageText("");
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior="padding">
      <View className="flex-row items-center gap-3 border-b border-black/5 bg-surface px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back-outline" size={26} color="#1F2A33" />
        </Pressable>

        {avatar ? (
          <Image
            source={avatar}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View className="h-10 w-10 rounded-full bg-gray-300" />
        )}

        <View className="flex-1">
          <Text
            className="text-base font-bold text-foreground"
            numberOfLines={1}
          >
            {name ?? "Chat"}
          </Text>
          <Text className="text-xs text-foreground-muted">
            {!isConnected
              ? "connecting..."
              : isTyping
                ? "typing..."
                : isOnline
                  ? "online"
                  : "offline"}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        {isLoading && !messages?.length ? (
          <ActivityIndicator className="mt-8" />
        ) : messages?.length ? (
          messages.map((msg) => {
            const mine = currentUser?._id === msg.senderId._id;
            return (
              <View
                key={msg._id}
                className={
                  mine
                    ? "max-w-[80%] self-end rounded-2xl rounded-br-sm bg-foreground px-4 py-2"
                    : "max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-surface px-4 py-2"
                }
              >
                <Text className={mine ? "text-background" : "text-foreground"}>
                  {msg.messageContent}
                </Text>
              </View>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-foreground-muted">
              No messages yet. Say hi.
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-end gap-2 border-t border-black/5 bg-surface px-3 py-2">
        <TextInput
          className="max-h-28 flex-1 rounded-2xl bg-surface-raised px-4 py-2 text-foreground"
          placeholder={isConnected ? "Message..." : "Connecting..."}
          placeholderTextColor="#566574"
          multiline
          value={messageText}
          onChangeText={handleTyping}
          onSubmitEditing={handleSend}
          submitBehavior="submit"
          returnKeyType="send"
        />

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          className={
            canSend
              ? "h-10 w-10 items-center justify-center rounded-full bg-foreground"
              : "h-10 w-10 items-center justify-center rounded-full bg-foreground/20"
          }
        >
          <Ionicons
            name="send"
            size={18}
            color={canSend ? "#E8EDF0" : "#566574"}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
