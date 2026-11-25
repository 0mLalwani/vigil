import { useAuth, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
export default function ProfileTab() {
  const { signOut } = useAuth();
  const { user } = useUser();
  return (
    <View className="p-4">
      <View className="flex items-center gap-2">
        <Image
          source={user?.imageUrl}
          style={{ width: 100, height: 100, borderRadius: 999 }}
        />
        <Text>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text>{user?.primaryEmailAddress?.emailAddress}</Text>
        <Pressable className="w-full bg-red-400 p-4" onPress={() => signOut()}>
          <Text className="text-center">Signout</Text>
        </Pressable>
      </View>
    </View>
  );
}
