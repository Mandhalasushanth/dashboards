import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

// iOS bottom sheet around the date spinner (Android uses the platform dialog and needs no styles).
export const styles = StyleSheet.create({
  iosModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  iosPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    overflow: "hidden",
  },
  iosPickerHeader: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  iosHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  iosDoneButton: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },
  iosCancelButton: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
  },
});
