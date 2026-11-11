import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useApplicationStore } from "@/store/applicationStore";

/**
 * "Contact support" used to open a separate support chat. Help now comes from the manager handling the customer's
 * application, so this opens the Chat tab of their most recent application (or the applications list when they
 * have none yet).
 */
export default function SupportRoute() {
  const router = useRouter();
  const applications = useApplicationStore((state) => state.applications);

  useEffect(() => {
    const latest = [...applications].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
    if (latest) {
      router.replace({ pathname: "/application/[id]", params: { id: latest.id, tab: "CHAT" } } as never);
    } else {
      router.replace("/(main)/applications" as never);
    }
  }, [applications, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
