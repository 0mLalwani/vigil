import { useQuery } from "@tanstack/react-query";
import { User } from "../types/allTypes";
import { useApi } from "./useAxiosApi";

export function useUser() {
  const api = useApi();
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get<User>("/api/auth/me");
      console.log("Here's response from /auth/me: ", data);
      return data;
    },
  });
}
