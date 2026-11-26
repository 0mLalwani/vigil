import SessionSync from "@/components/SessionSync";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <SessionSync />
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
            <Stack.Screen
              name="find-chat"
              options={{
                animation: "fade_from_bottom",
                presentation: "modal",
              }}
            />
          </Stack>
        </SafeAreaView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
