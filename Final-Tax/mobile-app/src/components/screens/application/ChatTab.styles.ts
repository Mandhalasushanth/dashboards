import { StyleSheet } from "react-native";

export const chatStyles = StyleSheet.create({
  chatScreenContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  chatMessagesList: { flex: 1 },
  chatMessagesContent: { paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 },
  chatEmptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  chatEmptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  chatEmptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A2346",
    marginBottom: 6,
    textAlign: "center",
  },
  chatEmptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
  },
  chatRowUser: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
    paddingLeft: 44,
  },
  chatBubbleUser: {
    backgroundColor: "#0A2346",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "100%",
  },
  chatTextUser: { fontSize: 13.5, color: "#FFFFFF", lineHeight: 19 },
  chatTimestampUser: {
    fontSize: 10.5,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "right",
    marginRight: 2,
  },
  chatRowCA: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
    paddingRight: 44,
  },
  chatAvatarCA: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  chatAvatarTextCA: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  chatContentCA: { flex: 1 },
  chatBubbleCA: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  chatTextCA: { fontSize: 13.5, color: "#0F172A", lineHeight: 19 },
  chatTimestampCA: { fontSize: 10.5, color: "#94A3B8", marginTop: 4, marginLeft: 2 },

  /* Application Context Card */
  contextCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contextCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  contextCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A2346",
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  contextCardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  contextCardBadgeText: { fontSize: 10.5, fontWeight: "700" },
  contextCardSubtitle: { fontSize: 12, color: "#64748B", marginBottom: 8 },
  contextProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  contextProgressBarWrap: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  contextProgressBarFill: { height: 4, borderRadius: 2, backgroundColor: "#EA580C" },
  contextCardAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  contextCardActionText: { fontSize: 11.5, fontWeight: "600", color: "#0A2346" },

  /* Date Divider */
  dateDividerWrap: { alignItems: "center", marginVertical: 12 },
  dateDividerText: { fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.6 },

  /* Sender Labels & Delivery */
  senderLabelCA: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 3,
    marginLeft: 2,
  },
  senderLabelUser: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 3,
    marginRight: 2,
    textAlign: "right",
  },
  userDeliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 3,
  },

  /* Quick Questions */
  quickQuestionsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  quickQuestionsHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  quickQuestionsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  quickChipsScroll: { flexDirection: "row", alignItems: "center", paddingBottom: 2 },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickChipText: { fontSize: 12, fontWeight: "600", color: "#0A2346" },

  /* Attachment Action */
  chatAttachBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Attachment Thumbnail Preview (Before Sending) */
  attachmentPreviewBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  attachmentPreviewThumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#CBD5E1",
  },
  attachmentPreviewThumb: { width: 44, height: 44 },
  attachmentPreviewInfo: { flex: 1, marginLeft: 10, marginRight: 8 },
  attachmentPreviewName: { fontSize: 13, fontWeight: "600", color: "#0A2346" },
  attachmentPreviewMeta: { fontSize: 11, color: "#64748B", marginTop: 2 },
  attachmentRemoveBtn: { padding: 4 },

  /* Chat Bubble Images */
  chatImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    maxWidth: 240,
    maxHeight: 180,
  },
  chatImage: { width: 220, height: 160, borderRadius: 12 },
  chatImageLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(241, 245, 249, 0.7)",
  },
  chatImageFallback: {
    width: 200,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
  },
  chatImageFallbackText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
  },
  chatImageCaptionUser: { fontSize: 13.5, color: "#FFFFFF", lineHeight: 19, marginTop: 6 },
  chatImageCaptionCA: { fontSize: 13.5, color: "#0F172A", lineHeight: 19, marginTop: 6 },

  chatComposerWrap: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  chatComposerInsetNone: { paddingBottom: 10 },
  chatComposerInsetStandard: { paddingBottom: 16 },
  chatComposerInsetTall: { paddingBottom: 28 },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 38,
    maxHeight: 110,
    paddingVertical: 6,
  },
  chatSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EA580C",
    alignItems: "center",
    justifyContent: "center",
  },
  chatSendBtnDisabled: { opacity: 0.4 },
  chatSecurityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 8,
    marginBottom: 4,
  },
  chatSecurityNoteText: { fontSize: 11, color: "#94A3B8", fontWeight: "400" },
});

export function getProgressFillStyle(percent: number) {
  return { width: `${percent}%` as const };
}

export function getBadgeBgStyle(bgColor: string) {
  return { backgroundColor: bgColor };
}

export function getBadgeTextColorStyle(textColor: string) {
  return { color: textColor };
}

export function getComposerInsetStyle(inset?: number) {
  if (!inset || inset <= 0) {
    return chatStyles.chatComposerInsetNone;
  }
  if (inset >= 30) {
    return chatStyles.chatComposerInsetTall;
  }
  return chatStyles.chatComposerInsetStandard;
}
