import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#EF4444",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  inputBoxError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputValue: {
    flex: 1,
    fontSize: 15,
    color: "#0B1F3A",
  },
  calendarIconRight: {
    marginLeft: 10,
  },
  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
  },
  iosPickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  iosPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iosPickerCancel: {
    fontSize: 16,
    color: "#64748B",
  },
  iosPickerConfirm: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EA580C",
  },
});
