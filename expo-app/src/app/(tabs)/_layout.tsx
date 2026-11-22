import { View, Text, ActivityIndicator } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "@clerk/expo";

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
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#E8EDF0",
          paddingTop: 8,
          height: 60,
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
