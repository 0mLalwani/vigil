import { useQuery } from "@tanstack/react-query";
import { Message } from "../types/allTypes";
import { useApi } from "./useAxiosApi";

export function useMessages(chatId: string) {
  const api = useApi();
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const { data } = await api.get<Message[]>(`/api/message/${chatId}`);
      console.log("Messages from server for chat: ", chatId, "are :", data);
      return data;
    },
    enabled: Boolean(chatId),
  });
}
