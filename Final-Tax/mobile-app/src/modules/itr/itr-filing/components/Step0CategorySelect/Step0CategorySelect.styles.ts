import { StyleSheet, Dimensions } from "react-native";
import { BrandColors } from "@/shared/theme";

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CONTAINER_PADDING = 16;
// 2 columns
const CARD_WIDTH = (width - CONTAINER_PADDING * 2 - CARD_GAP) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingTop: 12,
  },
  // Top Header Card
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#FFEDD5",
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerCategoryTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  accountTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  accountTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  accountTypeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1D4ED8",
    marginLeft: 4,
  },
  accountTypeNotice: {
    fontSize: 11,
    color: "#94A3B8",
    flex: 1,
  },
  // 2-Column Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: CARD_GAP,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    position: "relative",
    minHeight: 116,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    backgroundColor: "#0A2540",
    borderColor: BrandColors.PRIMARY_ORANGE,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCheckmarkBox: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIconBoxSelected: {
    backgroundColor: "#1E3A5F",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  cardTitleSelected: {
    color: "#FFFFFF",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  cardSubtitleSelected: {
    color: "#94A3B8",
  },
  // Bottom Fixed Button Bar
  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: CONTAINER_PADDING,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  startBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  startBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  startBtnTextDisabled: {
    color: "#64748B",
  },
});
