import Ionicons from "@react-native-vector-icons/ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useApi } from "../../../hooks/useAxiosApi";
import { Chat, User } from "../../../types/allTypes";

export default function FindChat() {
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  //get chats
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data }: { data: User[] } = await api.get("/api/user");
      console.log(data);
      return data;
    },
  });
  //handle creation
  const mutation = useMutation({
    mutationFn: async (participantId: string) => {
      const { data, status } = await api.post(`/api/chat/${participantId}`);
      console.log("mutation sent to backend: status, ", status);
      return data;
    },
    onSuccess: () => {
      //refetch user chats
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
  if (isLoading || mutation.isPending) {
    return (
      <ActivityIndicator
        className="flex h-screen items-center justify-center"
        size="large"
      />
    );
  }
  if (isError) {
    return (
      <View className="flex h-full items-center justify-center">
        <Text>Failed to load users - {error.message}</Text>
      </View>
    );
  }
  return (
    <View className="p-6">
      <View className="flex items-end">
        <Pressable
          onPress={() => router.back()}
          className="rounded-xl active:bg-gray-300"
        >
          <Ionicons name="close" size={24} />
        </Pressable>
      </View>
      <View className="pt-4">
        {data?.map((user) => (
          <Pressable
            className="flex flex-row items-center gap-4 rounded-xl border border-gray-300 p-4"
            key={user._id}
            onPress={() =>
              mutation.mutate(user._id, {
                onSuccess: (newChat: Chat) => {
                  router.dismiss();
                  setTimeout(() => {
                    router.push({
                      pathname: `/chat/[id]`,
                      params: { id: newChat._id },
                    });
                  }, 250);
                },
                onError: (err) => {
                  console.log(err.message);
                },
              })
            }
          >
            <Image
              source={user.avatar}
              style={{ height: 48, width: 48, borderRadius: 999 }}
            />
            <View>
              <Text className="text-xl font-extrabold">{user.name}</Text>
              <Text>{user.email}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
