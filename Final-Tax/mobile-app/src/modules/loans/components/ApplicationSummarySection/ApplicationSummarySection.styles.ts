import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    shadowColor: "#083B75",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0F5FA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#EAF1FE",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  editText: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.PRIMARY_BLUE,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 3,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
    flex: 1.4,
    textAlign: "right",
  },
  highlightValue: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
  badge: {
    alignSelf: "flex-end",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  activeBadge: {
    backgroundColor: "#ECFDF5",
  },
  activeBadgeText: {
    color: "#166534",
  },
  cardError: {
    borderColor: "#FECACA",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#B91C1C",
  },
  titleText: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
});
