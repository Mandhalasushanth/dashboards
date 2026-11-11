import React from "react";
import { View, ActivityIndicator, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Colors } from "@/design-system/colors";

export interface LoaderProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Loader: React.FC<LoaderProps> = ({
  message,
  size = "large",
  color = Colors.primary,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});

export default Loader;
