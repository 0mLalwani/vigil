import { useAuth } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";

const ProfileTab = () => {
  const { signOut } = useAuth();
  return (
    <View>
      <Pressable className="w-full bg-red-400 p-4" onPress={() => signOut()}>
        <Text className="text-center">Signout</Text>
      </Pressable>
    </View>
  );
};

export default ProfileTab;
