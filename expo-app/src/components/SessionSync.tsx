import { useAuth } from "@clerk/expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApi } from "../../hooks/useAxiosApi";
import { useSocketStorage } from "../../lib/socket";

//handles auth sync to the /POST callback & socket connection on startup in root layout
export default function SessionSync() {
  const { getToken, isSignedIn, sessionId, isLoaded } = useAuth();
  const api = useApi();
  const queryClient = useQueryClient();
  const connect = useSocketStorage((store) => store.connect);
  const disconnect = useSocketStorage((store) => store.disconnect);

  const {
    data: synced,
    error,
    status,
    failureCount,
  } = useQuery({
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
  console.log(
    "[auth-sync] state",
    status,
    failureCount,
    synced?.message,
    error,
  );

  useEffect(() => {
    if (!isSignedIn || !synced) return;
    let cancelled = false;
    getToken().then((token) => {
      if (token && !cancelled) connect(getToken, queryClient);
    });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, synced, connect, getToken, queryClient]);

  useEffect(() => {
    if (!isSignedIn) disconnect();
    return () => disconnect();
  }, [isSignedIn, disconnect]);
  return null;
}
