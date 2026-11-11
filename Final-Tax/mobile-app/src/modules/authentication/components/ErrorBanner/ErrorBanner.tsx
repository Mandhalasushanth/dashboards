import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ErrorBanner.styles";

interface ErrorBannerProps {
  error: string | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={20} color="#DC2626" style={styles.icon} />
      <Text style={styles.text}>{error}</Text>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color="#991B1B" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default ErrorBanner;
