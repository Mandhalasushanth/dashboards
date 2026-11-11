import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/(main)/profile.styles";

interface ProfileModalHeaderProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  onClose: () => void;
  colors: any;
}

/**
 * Title row shared by the profile dialogs. The close button sits in this row, not on top of the content,
 * so it can never cover the first detail (it used to overlap the name and PAN once a profile was complete).
 */
export function ProfileModalHeader({ title, icon, iconColor, iconBg, onClose, colors }: ProfileModalHeaderProps) {
  return (
    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
      <View style={[styles.modalHeaderIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.modalHeaderTitle, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <TouchableOpacity
        style={styles.modalHeaderClose}
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

/** "2000-11-05" -> "5 Nov 2000"; anything else is shown as it is. */
export function formatProfileDate(value?: string | null): string {
  if (!value) return "Not provided";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** "PROPRIETORSHIP" -> "Proprietorship", "PRIVATE_LIMITED" -> "Private Limited". */
export function formatProfileCode(value?: string | null): string {
  if (!value) return "";
  return /^[A-Z_ ]+$/.test(value)
    ? value
        .toLowerCase()
        .split(/[_ ]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : value;
}
