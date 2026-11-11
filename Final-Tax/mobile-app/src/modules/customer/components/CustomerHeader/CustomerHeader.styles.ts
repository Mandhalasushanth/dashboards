import { StyleSheet, TextStyle } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});

export const getTitleThemedStyle = (color: string): TextStyle => ({
  color,
});

export const getSubtitleThemedStyle = (color: string): TextStyle => ({
  color,
});
