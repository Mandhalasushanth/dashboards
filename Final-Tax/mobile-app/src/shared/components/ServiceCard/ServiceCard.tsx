import React from "react";
import { View, Text, StyleSheet, Platform, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/design-system/colors";
import { ScalePressable } from "@/shared/components/ScalePressable/ScalePressable";

export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  iconType?:
    | "registration"
    | "filing"
    | "compliance"
    | "amendment"
    | "cancellation"
    | "certificate"
    | string;
  iconColor?: string;
  iconBg?: string;
  route: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBg?: string;
  badgeVariant?: "start" | "rate" | "custom";
  rateText?: string;
  iconImage?: any;
}

export interface ServiceCardProps {
  item: ServiceCardData;
  onPress?: (item: ServiceCardData) => void;
}

const GST_3D_ICONS: Record<string, any> = {
  "gst-registration": require("../../../../assets/images/services/gst/gst_registration.png"),
  "gst-filing": require("../../../../assets/images/services/gst/gst_filing.png"),
  "gst-compliance": require("../../../../assets/images/services/gst/gst_compliance.png"),
  "gst-amendment": require("../../../../assets/images/services/gst/gst_amendment.png"),
  "gst-cancellation": require("../../../../assets/images/services/gst/gst_cancellation.png"),
  "gst-certificate": require("../../../../assets/images/services/gst/gst_certificate.png"),
  registration: require("../../../../assets/images/services/gst/gst_registration.png"),
  filing: require("../../../../assets/images/services/gst/gst_filing.png"),
  compliance: require("../../../../assets/images/services/gst/gst_compliance.png"),
  amendment: require("../../../../assets/images/services/gst/gst_amendment.png"),
  cancellation: require("../../../../assets/images/services/gst/gst_cancellation.png"),
  certificate: require("../../../../assets/images/services/gst/gst_certificate.png"),
};

const ITR_3D_ICONS: Record<string, any> = {
  "itr-filing": require("../../../../assets/images/services/itr/itr_filing.png"),
  "tds-refund": require("../../../../assets/images/services/itr/tds_refund.png"),
  "previous-year-itr": require("../../../../assets/images/services/itr/previous_year_itr.png"),
  "revised-itr": require("../../../../assets/images/services/itr/revised_itr.png"),
  "tax-notice-assistance": require("../../../../assets/images/services/itr/tax_notice_assistance.png"),
};

const renderCardIcon = (item: ServiceCardData) => {
  const bg = item.iconBg || "#EDF9F3";
  const icon3D =
    item.iconImage ||
    GST_3D_ICONS[item.id] ||
    ITR_3D_ICONS[item.id] ||
    (item.iconType ? GST_3D_ICONS[item.iconType] : undefined);

  if (icon3D) {
    return (
      <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
        <Image
          source={icon3D}
          style={styles.icon3DImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
      <Ionicons
        name={(item.iconName || "document-text") as any}
        size={22}
        color={item.iconColor || BrandColors.PRIMARY_BLUE}
      />
    </View>
  );
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, onPress }) => {
  return (
    <ScalePressable onPress={() => onPress?.(item)} style={styles.container}>
      <View style={styles.card}>
        {renderCardIcon(item)}

        <View style={styles.detailsCol}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.descText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {item.badgeText || item.rateText ? (
          <View style={styles.rightCol}>
            {item.badgeText && (
              <View
                style={[
                  styles.badgePill,
                  item.badgeBg ? { backgroundColor: item.badgeBg } : null,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.badgeColor ? { color: item.badgeColor } : null,
                  ]}
                >
                  {item.badgeText}
                </Text>
              </View>
            )}

            {item.rateText && (
              <Text style={styles.rateText}>{item.rateText}</Text>
            )}

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#94A3B8"
              style={styles.chevron}
            />
          </View>
        ) : (
          <View style={styles.chevronOnlyWrapper}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94A3B8"
            />
          </View>
        )}
      </View>
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 13,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  icon3DImage: {
    width: 48,
    height: 48,
    transform: [{ scale: 1.1 }],
  },
  detailsCol: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F3567",
    letterSpacing: -0.2,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  descText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: 3,
    fontWeight: "400",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 48,
    marginLeft: 8,
  },
  chevronOnlyWrapper: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badgePill: {
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: BrandColors.PRIMARY_ORANGE,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  rateText: {
    color: BrandColors.PRIMARY_ORANGE,
    fontSize: 12,
    fontWeight: "700",
  },
  chevron: {
    marginTop: "auto",
  },
});

export default ServiceCard;
