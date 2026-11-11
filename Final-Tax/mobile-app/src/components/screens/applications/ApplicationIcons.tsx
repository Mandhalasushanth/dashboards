import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path, Rect } from "react-native-svg";
import type { ServiceCategoryId } from "@/types/domain";
import { styles } from "@/styles/app/(main)/applications.styles";

interface TaggedDocIconProps {
  tag: string;
  color?: string;
  size?: number;
}

export function TaggedDocIcon({
  tag,
  color = "#083B75",
  size = 26,
}: TaggedDocIconProps) {
  const containerStyle = [
    styles.docIconWrap,
    { width: size, height: size + 2 },
  ];
  const tagFontSize = size > 24 ? 6.5 : 5.5;

  return (
    <View style={containerStyle}>
      <Svg width={size} height={size + 2} viewBox="0 0 24 26" fill="none">
        <Path
          d="M4 3.5C4 2.4 4.9 1.5 6 1.5H14.5L20 7V22.5C20 23.6 19.1 24.5 18 24.5H6C4.9 24.5 4 23.6 4 22.5V3.5Z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14 1.5V7H19.5"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8 7H11"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <Rect
          x="6.5"
          y="12"
          width="11"
          height="8.5"
          rx="2"
          stroke={color}
          strokeWidth="1.4"
        />
      </Svg>
      <Text
        style={[
          styles.docIconTag,
          { fontSize: tagFontSize, color },
        ]}
      >
        {tag}
      </Text>
    </View>
  );
}

interface LoanRupeeIconProps {
  color?: string;
  size?: number;
}

export function LoanRupeeIcon({
  color = "#EA580C",
  size = 26,
}: LoanRupeeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.5 2 6.5 4.5 6.5 7C6.5 8.2 7 9.2 7.7 10H5C3.9 10 3 10.9 3 12V14C3 15.1 3.9 16 5 16H8L13 21C13.5 21.5 14.3 21.3 14.6 20.7L15.3 19.3C15.6 18.7 15.3 18 14.7 17.7L12.5 16.6H17C19.2 16.6 21 14.8 21 12.6C21 10.4 19.2 8.6 17 8.6H14.5C14.8 7.8 15 7 15 6C15 3.8 13.7 2 12 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8C13.1 8 14 7.1 14 6Z"
        stroke={color}
        strokeWidth="1.6"
      />
    </Svg>
  );
}

const CATEGORY_ICON_BUILDERS: Record<
  string,
  (color: string) => React.ReactElement
> = {
  ALL: (color) => <Ionicons name="grid-outline" size={23} color={color} />,
  GST: (color) => <TaggedDocIcon tag="GST" color={color} size={22} />,
  ITR: (color) => <TaggedDocIcon tag="ITR" color={color} size={22} />,
  LOANS: (color) => <LoanRupeeIcon color={color} size={22} />,
  BUSINESS: (color) => (
    <Ionicons name="briefcase-outline" size={23} color={color} />
  ),
  INSURANCE: (color) => (
    <Ionicons name="shield-checkmark-outline" size={23} color={color} />
  ),
};

export function CategoryTabIcon({
  id,
  isActive,
}: {
  id: "ALL" | ServiceCategoryId;
  isActive: boolean;
}) {
  const color = isActive ? "#FF5722" : "#0A2346";
  const builder = CATEGORY_ICON_BUILDERS[id];
  return builder
    ? builder(color)
    : <Ionicons name="folder-outline" size={23} color={color} />;
}

const AVATAR_ICON_BUILDERS: Partial<
  Record<ServiceCategoryId, (color: string) => React.ReactElement>
> = {
  GST: (color) => <TaggedDocIcon tag="GST" color={color} size={26} />,
  ITR: (color) => <TaggedDocIcon tag="ITR" color={color} size={26} />,
  BUSINESS: (color) => (
    <Ionicons name="briefcase-outline" size={26} color={color} />
  ),
  LOANS: (color) => <LoanRupeeIcon color={color} size={26} />,
  INSURANCE: (color) => (
    <Ionicons name="shield-checkmark-outline" size={26} color={color} />
  ),
};

const GST_SERVICE_ICONS: Record<string, any> = {
  "gst-registration": require("../../../../assets/images/services/gst/gst_registration.png"),
  "gst-filing": require("../../../../assets/images/services/gst/gst_filing.png"),
  "gst-compliance": require("../../../../assets/images/services/gst/gst_compliance.png"),
  "gst-amendment": require("../../../../assets/images/services/gst/gst_amendment.png"),
  "gst-cancellation": require("../../../../assets/images/services/gst/gst_cancellation.png"),
  "gst-certificate": require("../../../../assets/images/services/gst/gst_certificate.png"),
};

const localStyles = StyleSheet.create({
  serviceIconImage: {
    width: 32,
    height: 32,
  },
  gstAvatarBox: {
    backgroundColor: "#F0FDF4",
  },
});

function getGstServiceIcon(serviceId?: string, serviceName?: string) {
  if (serviceId && GST_SERVICE_ICONS[serviceId]) {
    return GST_SERVICE_ICONS[serviceId];
  }
  const lower = (serviceName || "").toLowerCase();
  if (lower.includes("registration")) return GST_SERVICE_ICONS["gst-registration"];
  if (lower.includes("filing")) return GST_SERVICE_ICONS["gst-filing"];
  if (lower.includes("amendment")) return GST_SERVICE_ICONS["gst-amendment"];
  if (lower.includes("cancellation")) return GST_SERVICE_ICONS["gst-cancellation"];
  if (lower.includes("compliance")) return GST_SERVICE_ICONS["gst-compliance"];
  if (lower.includes("certificate")) return GST_SERVICE_ICONS["gst-certificate"];
  return null;
}

export function ApplicationCardAvatar({
  category,
  serviceId,
  serviceName,
}: {
  category: ServiceCategoryId;
  serviceId?: string;
  serviceName?: string;
}) {
  const isOrange = category === "BUSINESS" || category === "LOANS";
  const bg = isOrange ? "#FFF1E8" : "#EAF2FF";
  const color = isOrange ? "#EA580C" : "#083B75";

  if (category === "GST") {
    const gstIcon = getGstServiceIcon(serviceId, serviceName);
    if (gstIcon) {
      return (
        <View style={[styles.avatarBox, localStyles.gstAvatarBox]}>
          <Image
            source={gstIcon}
            style={localStyles.serviceIconImage}
            resizeMode="contain"
          />
        </View>
      );
    }
  }

  const icon = AVATAR_ICON_BUILDERS[category]?.(color) ?? (
    <Ionicons name="document-text-outline" size={26} color={color} />
  );

  return <View style={[styles.avatarBox, { backgroundColor: bg }]}>{icon}</View>;
}
