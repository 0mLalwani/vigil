import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../lib/axios";

export default function AuthSync() {
  const api = useApi();
  const { isLoaded, isSignedIn, sessionId } = useAuth();

  const { data, error, status, failureCount } = useQuery({
    queryKey: ["auth-sync", sessionId],
    enabled: isLoaded && isSignedIn && Boolean(sessionId),
    retry: 3,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await api.post("/api/auth/callback");
      console.log("[auth-sync] response", res.status, res.data);
      return res.data as { message: string };
    },
  });

  console.log("[auth-sync] state", status, failureCount, data?.message, error);
  return null;
}
