import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { tdsDraftService } from "@/modules/itr/tds/services/tdsDraftService";
import { BrandColors } from "@/shared/theme";

/**
 * Replaces the old TdsRefundEntryScreen landing page.
 * Reads draft metadata and navigates directly into the appropriate flow step.
 * Preserves the same routing logic that was in TdsRefundEntryScreen.handleStart().
 */
export default function TdsRefundRoute() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meta = await tdsDraftService.getDraftMetadata();
        if (cancelled) return;
        if (meta?.step === "DOCUMENTS") {
          router.replace("/service/tds-checklist" as any);
        } else if (meta?.step === "ESTIMATE" || meta?.step === "PAYMENT") {
          router.replace("/service/tds-estimate" as any);
        } else {
          router.replace("/service/tds-form" as any);
        }
      } catch {
        if (!cancelled) router.replace("/service/tds-form" as any);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
      <ActivityIndicator size="large" color={BrandColors.PRIMARY_ORANGE} />
    </View>
  );
}
