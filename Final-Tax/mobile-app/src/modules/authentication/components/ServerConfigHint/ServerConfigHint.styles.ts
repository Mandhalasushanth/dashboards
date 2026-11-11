import { StyleSheet } from "react-native";
import { BrandColors } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  serverConfigBtn: {
    alignSelf: "center",
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  serverConfigBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.PRIMARY_BLUE,
  },
});
