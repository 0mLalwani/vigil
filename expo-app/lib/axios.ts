import { useAuth } from "@clerk/expo";
import axios, { InternalAxiosRequestConfig } from "axios";
import { useMemo } from "react";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL) throw new Error("EXPO_PUBLIC_API_URL is not set");

export function useApi() {
  const { getToken } = useAuth();

  return useMemo(() => {
    const api = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
    api.interceptors.request.use(async (reqConfig) => {
      const token = await getToken();
      if (token) reqConfig.headers.Authorization = `Bearer ${token}`;
      //finally return the request to the next interceptor (if any)
      return reqConfig;
    });
    return api;
  }, [getToken]);
}
