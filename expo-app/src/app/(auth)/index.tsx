import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import useSocialAuth from "../../../hooks/useSocials";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const { handleSocialAuth } = useSocialAuth();

  const handlePress = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { status, authSessionResult } = await handleSocialAuth();
      if (status === "incomplete") {
        setError("Sign-in could not be completed.");
      }
    } catch (err) {
      setError("Sign-in could not be completed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text>Welcome to Vigil</Text>
      <View>
        <Pressable
          className="rounded-2xl border bg-surface p-4"
          onPress={handlePress}
        >
          <Text className="">{loading ? "Loading..." : "Sign up"}</Text>
        </Pressable>
        {error ? <Text className="text-red-500">{error}</Text> : null}
      </View>
    </View>
  );
};

export default Auth;
