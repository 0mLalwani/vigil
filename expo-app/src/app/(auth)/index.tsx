import { View, Text, Pressable } from 'react-native'
import useSocialAuth from '../../../hooks/useSocials'
import { useState } from 'react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>()
  const { handleSocialAuth } = useSocialAuth()

  const handlePress = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { status, authSessionResult } = await handleSocialAuth();
      if (status === "incomplete") {
        setError("Sign-in could not be completed.")
      }
    } catch (err) {
      setError("Sign-in could not be completed.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text>Get ME INN</Text>
      <View>
        <Pressable
          className="bg-surface p-4 rounded-2xl border"
          onPress={handlePress}
        >
          <Text className=''>{loading ? "Loading..." : "Sign up"}</Text>
        </Pressable>
        {error ? <Text className="text-red-500">{error}</Text> : null}
      </View>
    </View>
  )
}

export default Auth