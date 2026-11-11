import { StyleSheet } from "react-native";

export const KYC_KEYWORDS = ["pan", "aadhaar", "photo"] as const;
export const GST_KEYWORDS = [
  "gst",
  "sales",
  "purchase",
  "certificate",
  "register",
] as const;

export const CATEGORIES = [
  "KYC Documents",
  "GST Documents",
  "Financial Documents",
] as const;

export const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    gap: 16,
  },
  categorySection: {
    gap: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  docsList: {
    gap: 8,
  },
  docCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  docInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "600",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sourceModalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  previewModalContainer: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  modalSub: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  sourceBtn: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  sourceBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  previewBox: {
    height: 200,
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000005",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  filePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  fileText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  fileUri: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  uploadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default styles;
