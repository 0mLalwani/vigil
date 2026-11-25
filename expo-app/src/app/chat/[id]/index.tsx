import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ChatPage() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>hello to chat - {id}</Text>
    </View>
  );
}
