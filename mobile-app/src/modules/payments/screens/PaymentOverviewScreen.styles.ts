import { StyleSheet, Dimensions } from "react-native";
import { BrandColors, BorderRadius, BorderWidth, Spacing, Typography } from "@/shared/theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  /* Navy Header matching My Applications */
  navyHeader: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: "relative",
    overflow: "hidden",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 4,
  },
  overviewCardWrapper: {
    width: "100%",
  },

  /* Content Scroll */
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },

  /* Overview Card */
  overviewCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  overviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Spacing.base,
  },
  overviewIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  overviewTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statColDivider: {
    borderLeftWidth: BorderWidth.thin,
    borderLeftColor: "#E2E8F0",
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.extraBold,
    color: "#0B2545",
  },
  statValuePending: {
    color: "#EA580C",
  },

  /* No Payments Yet Card (Image 1 reference) */
  emptyDuesCard: {
    backgroundColor: "#FFFBF7",
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: "#FDE6D2",
    marginBottom: Spacing.lg,
  },
  emptyDuesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  receiptIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF0E6",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDuesTextCol: {
    flex: 1,
  },
  emptyDuesTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
    marginBottom: 4,
  },
  emptyDuesSubtitle: {
    fontSize: Typography.fontSize.xs + 1,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: Spacing.sm + 2,
  },
  exploreServicesBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: "#0B2545",
    backgroundColor: BrandColors.WHITE,
  },
  exploreServicesBtnText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B2545",
  },

  /* Pending Application Payment Cards */
  pendingContainer: {
    marginBottom: Spacing.lg,
  },
  pendingSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B2545",
  },
  pendingCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: "#FED7AA",
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pendingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  pendingServiceName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
    flex: 1,
  },
  dueBadge: {
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: "#EA580C",
  },
  pendingAppId: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginBottom: Spacing.sm,
  },
  pendingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: BorderWidth.thin,
    borderTopColor: "#F1F5F9",
    paddingTop: Spacing.sm,
  },
  pendingAmountLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  pendingAmountValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extraBold,
    color: "#EA580C",
  },
  payNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FF5722",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  payNowBtnText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },

  /* Payment Activity */
  activitySection: {
    marginBottom: Spacing.lg,
  },
  emptyActivityBox: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    paddingVertical: 32,
    paddingHorizontal: Spacing.base,
    alignItems: "center",
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    marginTop: Spacing.sm,
  },
  emptyActivityIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm + 4,
  },
  emptyActivityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
    marginBottom: 4,
  },
  emptyActivitySubtitle: {
    fontSize: Typography.fontSize.xs + 1,
    color: "#64748B",
    textAlign: "center",
  },

  /* Activity item */
  activityCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityLeft: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 11,
    color: "#64748B",
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#059669",
    marginBottom: 2,
  },
  activityStatus: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#059669",
  },

  /* Quick Links */
  quickLinksSection: {
    marginBottom: Spacing.lg,
  },
  quickLinksCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  quickLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  quickLinkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  quickLinkText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#0F172A",
  },
  quickLinkDivider: {
    height: BorderWidth.thin,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
});

export const getPaymentHeaderThemedStyle = (topInset: number) => ({
  paddingTop: topInset + 10,
});
