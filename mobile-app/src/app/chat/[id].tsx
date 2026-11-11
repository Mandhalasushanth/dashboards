import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

/** The application chat now lives on the application's Chat tab (backend chat with its manager). */
export default function ChatRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      router.replace({ pathname: "/application/[id]", params: { id: String(id), tab: "CHAT" } } as never);
    } else {
      router.replace("/(main)/applications" as never);
    }
  }, [id, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
