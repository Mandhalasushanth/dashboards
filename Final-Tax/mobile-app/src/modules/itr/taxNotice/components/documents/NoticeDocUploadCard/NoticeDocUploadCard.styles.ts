import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    marginBottom: 12,
  },
  cardError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1F3A",
    marginBottom: 4,
  },
  mandatoryStar: {
    color: "#EF4444",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1F3A",
  },
  uploadedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 8,
    padding: 10,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#064E3B",
  },
  fileSize: {
    fontSize: 12,
    color: "#059669",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 12,
  },
  actionButton: {
    padding: 4,
  },
  deleteButton: {
  },
  previewModal: {
    flex: 1,
    backgroundColor: "#000000",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  previewTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  closePreviewButton: {
    padding: 4,
  },
  previewContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  noPreview: {
    alignItems: "center",
  },
  noPreviewText: {
    color: "#94A3B8",
    marginTop: 16,
    fontSize: 16,
  },
});
