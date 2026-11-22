import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/expo";
import { ActivityIndicator } from "react-native";

const AuthLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return (
      <ActivityIndicator
        className="flex h-screen items-center justify-center"
        size="large"
      />
    );
  }
  if (isSignedIn) {
    return <Redirect href="/(tabs)/chat" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
