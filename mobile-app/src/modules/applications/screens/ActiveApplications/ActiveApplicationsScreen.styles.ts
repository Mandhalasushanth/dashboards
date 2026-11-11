import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  /* Navy Header */
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
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: { flex: 1, paddingRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 13, fontWeight: "400", color: "rgba(255, 255, 255, 0.75)", marginTop: 4 },

  /* 4-Column Overview KPI Card (Inside Navy Header) */
  overviewCardWrapper: { width: "100%" },
  overviewCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  overviewCol: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4, borderRadius: 12 },
  activeOverviewCol: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FFEDD5" },
  activeOverviewColDark: { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#FF5722" },
  overviewTotalNum: { fontSize: 22, fontWeight: "800", color: "#EA580C", marginBottom: 4, letterSpacing: -0.3 },
  circleIconInProgress: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  circleIconCompleted: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  circleIconVerification: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFEDD5", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  circleNumVerification: { fontSize: 15, fontWeight: "800", color: "#EA580C" },
  overviewSub: { fontSize: 11, textAlign: "center", lineHeight: 14, fontWeight: "500" },
  overviewDivider: { width: 1, height: 36, alignSelf: "center" },

  /* Search Bar (Full Width, Immediately Below Header) */
  searchRow: { paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  searchFilterRow: { paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    height: 44,
  },
  searchContainerDark: { backgroundColor: "#1E293B", borderColor: "#334155" },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: "#0F172A", fontWeight: "500" },
  searchInputDark: { color: "#F8FAFC" },
  clearSearchBtn: { padding: 4 },

  /* Category Filter Pills */
  categoryPillsScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
  activeCategoryPill: { backgroundColor: "#EA580C", borderColor: "#EA580C" },
  categoryPillText: { fontSize: 12.5, fontWeight: "600", color: "#475569" },
  activeCategoryPillText: { color: "#FFFFFF", fontWeight: "700" },

  /* Scrollable Body & List */
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  recentHeaderRow: { marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },

  /* Application Card (Clean Vertical Order) */
  appCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
  },
  avatarBox: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 },
  cardContent: { flex: 1, minWidth: 0, justifyContent: "center" },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: 6,
  },
  cardBadgeWrap: {
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceNameText: { fontSize: 14.5, fontWeight: "700", color: "#0F172A", letterSpacing: -0.2 },
  appliedDateText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  appliedDateTextDark: { color: "#94A3B8" },
  dateText: { fontSize: 12, color: "#64748B", fontWeight: "500", marginBottom: 8 },
  cardBadgeRow: { flexDirection: "row", alignItems: "center" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4.5, borderRadius: 8, alignSelf: "flex-start" },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  resumeBadge: { paddingHorizontal: 10, paddingVertical: 4.5, borderRadius: 8, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FFEDD5", alignSelf: "flex-start" },
  resumeBadgeText: { fontSize: 11, fontWeight: "700", color: "#EA580C" },
  cardChevronWrap: { marginLeft: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardChevron: { alignSelf: "center" },
  appIdRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  appIdText: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  bulletDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#94A3B8" },
  executiveRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 },
  executiveText: { fontSize: 11.5, color: "#64748B", flexShrink: 1 },
  badgeCol: { alignItems: "flex-end", justifyContent: "space-between", height: 50, flexShrink: 0 },
  cardRightColumn: { alignItems: "flex-end", justifyContent: "center", marginLeft: 8 },
  cardBadgeWithArrow: { flexDirection: "row", alignItems: "center", gap: 6 },

  /* Loading & Error States */
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 32, paddingHorizontal: 24, borderRadius: 16, borderWidth: 1, marginVertical: 16 },
  errorTitle: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 4 },
  errorText: { fontSize: 13, textAlign: "center", marginBottom: 16, lineHeight: 18 },
  retryButton: { backgroundColor: "#EA580C", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 20 },
  emptyIcon: { marginBottom: 12 },
  emptyText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 13, fontWeight: "400", textAlign: "center", marginTop: 4 },

  /* Modal */
  categoryModalBackdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.45)", justifyContent: "center", alignItems: "center", padding: 24 },
  categoryModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryModalTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 14 },
  categoryModalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  categoryModalOptionActive: { backgroundColor: "#FFF7ED" },
  categoryModalOptionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  categoryModalOptionLabel: { fontSize: 14.5, fontWeight: "600", color: "#334155" },
  categoryModalOptionLabelActive: { color: "#EA580C", fontWeight: "700" },
  categoryModalCloseBtn: { marginTop: 12, alignItems: "center", paddingVertical: 10 },
  categoryModalCloseText: { fontSize: 14, fontWeight: "600", color: "#64748B" },

  /* CategoryTab / Document Icon */
  docIconWrap: { alignItems: "center", justifyContent: "center" },
  docIconTag: { position: "absolute", bottom: 4.5, fontWeight: "900", letterSpacing: -0.2 },
});

export const getActiveApplicationsContainerThemedStyle = (
  isDark: boolean,
  backgroundColor: string
) => ({
  backgroundColor: isDark ? backgroundColor : "#F8FAFC",
});

export const getNavyHeaderThemedStyle = (topInset: number) => ({
  paddingTop: topInset + 10,
});

export const getCategoryPillThemedStyle = (
  isActive: boolean,
  cardBg: string,
  borderColor: string
) => ({
  backgroundColor: isActive ? "#EA580C" : cardBg,
  borderColor: isActive ? "#EA580C" : borderColor,
});

export const getCategoryPillTextThemedStyle = (
  isDark: boolean,
  isActive: boolean,
  textColor: string
) => ({
  color: isDark && !isActive ? textColor : undefined,
});

export const getScrollContentThemedStyle = (paddingBottom: number) => ({
  paddingBottom,
});

export const getThemedTextColorStyle = (color: string) => ({
  color,
});

export const getErrorContainerThemedStyle = (
  cardBg: string,
  isDark: boolean,
  borderColor: string
) => ({
  backgroundColor: cardBg,
  borderColor: isDark ? borderColor : "#FEE2E2",
});

export const getErrorTitleThemedStyle = (isDark: boolean, textColor: string) => ({
  color: isDark ? textColor : "#0F172A",
});
