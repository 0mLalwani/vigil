import Ionicons from "@react-native-vector-icons/ionicons";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useApi } from "../../../lib/axios";
import { Chat } from "../../../types/allTypes";

export default function ChatTab() {
  const api = useApi();
  const router = useRouter();
  const {
    data: chats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data: apiResponse }: { data: Chat[] } =
        await api.get("/api/chat");
      return apiResponse;
    },
  });
  const goToChat = (chatId: string) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    });
  };
  if (isLoading) {
    return (
      <View>
        <Text className="p-4 text-center font-bold">Your Chats</Text>
        <ActivityIndicator
          className="flex h-screen items-center justify-center"
          size="large"
        />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex h-full items-center justify-center gap-6">
        <Text className="text-xl font-extrabold">Failed to load chats.</Text>
        <Pressable
          className="rounded-xl bg-red-400 p-2 text-xl"
          onPress={() => refetch}
        >
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View>
      <FlatList
        data={chats}
        keyExtractor={(chat) => chat._id}
        renderItem={(chat) => (
          <ChatItem chat={chat.item} handlePress={goToChat} />
        )}
        ListEmptyComponent={() => (
          <Text className="text-center">No chats yet.</Text>
        )}
        ListHeaderComponent={() => <ChatHeader />}
        // contentInsetAdjustmentBehavior="automatic"
        // showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function ChatItem({
  chat,
  handlePress,
}: {
  chat: Chat;
  handlePress: (chatId: string) => void;
}) {
  const participant = chat.participants[0];
  const isOnline = true;
  const isTyping = true;
  const hasUnread = true;
  return (
    <Pressable
      className="m-4 flex flex-row items-center gap-4 rounded-xl border border-gray-300 p-4 active:opacity-60"
      onPress={() => handlePress(chat._id)}
    >
      <View className="relative">
        <Image
          source={chat.participants[0].avatar}
          style={{ height: 48, width: 48, borderRadius: 999 }}
        />
        {isOnline && (
          <View className="absolute bottom-0 right-0 size-4 rounded-xl bg-green-500" />
        )}
      </View>
      <View className="flex-1">
        <View className="flex flex-row items-center justify-between">
          <Text className={`text-xl font-extrabold text-foreground`}>
            {chat.participants[0].name}
          </Text>
          <Text className="text-gray-500">
            {formatDistanceToNow(new Date(chat.lastMessageAt), {
              addSuffix: true,
            })}
          </Text>
        </View>
        <Text
          className={`${hasUnread || isTyping ? "text-green-500" : "text-gray-500"}`}
        >
          {isTyping
            ? "Typing..."
            : (chat.lastMessage?.messageContent ?? "No messages yet...")}
        </Text>
      </View>
    </Pressable>
  );
}

function ChatHeader() {
  const router = useRouter();
  return (
    <View className="mb-4 border-b border-gray-500 p-6">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-center text-xl font-extrabold">Your Chats</Text>
        <Pressable
          className="rounded-xl active:bg-gray-300"
          onPress={() => router.push("/find-chat")}
        >
          <Ionicons name="create-outline" size={24} />
        </Pressable>
      </View>
    </View>
  );
}
