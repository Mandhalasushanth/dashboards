import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./CertificateActionButtons.styles";

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  outline?: boolean;
  variant?: "primary" | "outline" | "text";
  onPressIn?: () => void;
  onPressOut?: () => void;
}

export function ActionButton({
  icon,
  text,
  onPress,
  outline,
  variant,
  onPressIn,
  onPressOut,
}: ActionButtonProps) {
  const isPrimary = variant === "primary" || outline === false;
  const isText = variant === "text";

  if (isPrimary) {
    return (
      <TouchableOpacity
        style={styles.orangeCta}
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <Ionicons name={icon} size={20} color="#FFF" style={styles.iconMarginRight8} />
        <Text style={styles.orangeCtaText}>{text}</Text>
      </TouchableOpacity>
    );
  }

  if (isText) {
    return (
      <TouchableOpacity style={styles.textOnlyBtn} activeOpacity={0.8} onPress={onPress}>
        <Ionicons name={icon} size={16} color="#64748B" style={styles.iconMarginRight6} />
        <Text style={styles.textOnlyBtnText}>{text}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.blueOutlineBtn} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#1E5EFF" style={styles.iconMarginRight8} />
      <Text style={styles.blueOutlineBtnText}>{text}</Text>
    </TouchableOpacity>
  );
}
