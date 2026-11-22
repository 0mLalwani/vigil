import { useSSO } from "@clerk/expo";

export default function useSocialAuth() {
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async () => {
    const { createdSessionId, setActive, authSessionResult } =
      await startSSOFlow({ strategy: "oauth_google" });

    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
      return { status: "signed-in" };
    }
    return { status: "incomplete", authSessionResult };
  };
  return { handleSocialAuth };
}
