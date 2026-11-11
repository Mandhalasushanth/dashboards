/**
 * Screen: GST Hub Overview
 * Migrated to modular architecture.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ServiceHeader } from "@/shared/components/ServiceHeader";
import { ServiceList } from "@/shared/components/ServiceList";
import { useServiceAccessGuard } from "@/shared/hooks/useServiceAccessGuard";
import { gstService } from "@/modules/gst/services/GstService";
import { GstServiceItem } from "@/modules/gst/types/gst.types";
import { styles } from "./GstScreen.styles";
import { toHref } from "@/shared/utils/navigation";

export const GstScreen: React.FC = () => {
  const router = useRouter();
  const { accessService } = useServiceAccessGuard();
  const [services, setServices] = useState<GstServiceItem[]>([]);

  useEffect(() => {
    gstService.fetchGstServices().then(setServices);
  }, []);

  const handleCardPress = (item: GstServiceItem) => {
    if (item.route) {
      accessService(toHref(item.route));
    }
  };

  return (
    <View style={styles.container}>
      <ServiceHeader
        title="GST Services"
        subtitle="Complete your GST requirements with expert CA assistance and guaranteed compliance."
        tag="Financial Services"
        iconName="document-text-outline"
      />
      <ServiceList items={services} onItemPress={handleCardPress} />
    </View>
  );
};

export default GstScreen;
