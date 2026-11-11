import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const ILLUSTRATION_SIZE = 190;

export const styles = StyleSheet.create({
  stage: {
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    position: "absolute",
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    borderRadius: ILLUSTRATION_SIZE / 2,
    backgroundColor: BrandColors.PRIMARY_LIGHT_ORANGE,
  },
  person: {
    position: "absolute",
    left: 18,
    bottom: 16,
  },
  document: {
    position: "absolute",
    right: 22,
    top: 30,
  },
  magnifier: {
    position: "absolute",
    right: 40,
    top: 70,
  },
  badge: {
    position: "absolute",
    right: 12,
    top: 8,
  },
  sparkle: {
    position: "absolute",
    left: 36,
    top: 26,
  },
});
