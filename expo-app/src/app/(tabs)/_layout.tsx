import { useAuth } from "@clerk/expo";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return <ActivityIndicator size="large" />;
  }
  if (!isSignedIn) {
    return <Redirect href="/(auth)" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#E8EDF0",
          height: 40,
        },
        sceneStyle: {
          backgroundColor: "#F6F8F9",
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={size}
              color={"#1F2A33"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={30}
              color={"#1F2A33"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
