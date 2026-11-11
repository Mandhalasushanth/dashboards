import { apiClient } from "../../../../core/api/apiClient";
import * as FileSystem from "expo-file-system";
import { TdsDocumentItem } from "../types/tdsDocuments.types";
import { INITIAL_TDS_DOCUMENTS } from "../constants/tdsDocuments.constants";
import { TdsDocumentsDto } from "./tdsApiTypes";

// Helper: Read file URI as Base64 string for REST JSON transport (handles file://, content://, http://, data:)
export const readFileAsBase64 = async (uri?: string): Promise<string | null> => {
  if (!uri || typeof uri !== "string") return null;
  const cleanUri = uri.trim();
  if (!cleanUri) return null;

  // 1. Data URI prefix
  if (cleanUri.startsWith("data:")) {
    const commaIdx = cleanUri.indexOf(",");
    return commaIdx !== -1 ? cleanUri.substring(commaIdx + 1).trim() : null;
  }

  // 2. Already raw base64 string
  if (
    !cleanUri.startsWith("file:") &&
    !cleanUri.startsWith("content:") &&
    !cleanUri.startsWith("http:") &&
    !cleanUri.startsWith("https:") &&
    !cleanUri.startsWith("ph:") &&
    !cleanUri.startsWith("/")
  ) {
    if (cleanUri.length > 50 && /^[A-Za-z0-9+/=\s]+$/.test(cleanUri)) {
      return cleanUri.replace(/\s+/g, "");
    }
  }

  // 3. Strategy A: expo-file-system/legacy readAsStringAsync (official Expo SDK 57 legacy API)
  try {
    const FileSystemLegacy = await import("expo-file-system/legacy");
    if (FileSystemLegacy && typeof FileSystemLegacy.readAsStringAsync === "function") {
      const base64 = await FileSystemLegacy.readAsStringAsync(cleanUri, {
        encoding: FileSystemLegacy.EncodingType?.Base64 || ("base64" as any),
      });
      if (base64 && base64.trim().length > 0) {
        return base64.trim();
      }
    }
  } catch (legacyErr) {
    console.debug("[TDS API] FileSystemLegacy.readAsStringAsync attempt:", legacyErr);
  }

  // 4. Strategy B: React Native native fetch() -> Blob -> FileReader (handles content://, file://, http://)
  try {
    const response = await fetch(cleanUri);
    const blob = await response.blob();
    const base64Data = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (!res) return resolve(null);
        const commaIdx = res.indexOf(",");
        resolve(commaIdx !== -1 ? res.substring(commaIdx + 1).trim() : res.trim());
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });

    if (base64Data && base64Data.length > 0) {
      return base64Data;
    }
  } catch (fetchErr) {
    console.debug("[TDS API] fetch -> blob -> FileReader attempt:", fetchErr);
  }

  // 5. Strategy C: expo-file-system next File class
  try {
    const { File: ExpoFile } = await import("expo-file-system");
    if (ExpoFile) {
      const file = new ExpoFile(cleanUri);
      if (typeof (file as any).base64 === "function") {
        const b64 = await (file as any).base64();
        if (b64 && b64.trim().length > 0) return b64.trim();
      }
      if (typeof file.arrayBuffer === "function") {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        if (typeof btoa === "function") {
          return btoa(binary);
        }
      }
    }
  } catch (expoFileErr) {
    console.debug("[TDS API] ExpoFile attempt:", expoFileErr);
  }

  console.warn("⚠️ [TDS API] Could not convert document URI to Base64:", cleanUri);
  return null;
};

export const tdsDocumentsApiService = {
  saveDocuments: async (documents: TdsDocumentItem[], tdsRefundId: string): Promise<string> => {
    const getDocBase64 = async (docKey: string): Promise<string | null> => {
      const key = docKey.toLowerCase();
      const doc = documents.find((d) => {
        const hasUri = d.status === "uploaded" || Boolean(d.fileUri) || Boolean((d as any).uri);
        if (!hasUri) return false;

        const id = (d.id || "").toLowerCase();
        const icon = ((d as any).iconType || "").toLowerCase();
        const type = ((d as any).type || "").toLowerCase();
        const title = (d.title || "").toLowerCase();

        if (id === key || icon === key || type === key) return true;

        if (key === "pan") return (id.includes("pan") || icon.includes("pan") || title.includes("pan"));
        if (key === "form16") return (id === "form16" || icon === "form16" || (title.includes("form 16") && !title.includes("16a")));
        if (key === "form16a") return (id.includes("16a") || icon.includes("16a") || title.includes("16a"));
        if (key === "ais") return (id.includes("ais") || icon.includes("ais") || title.includes("ais"));
        if (key === "tis") return (id.includes("tis") || icon.includes("tis") || title.includes("tis"));
        if (key === "bank_statements") return (id.includes("bank") || icon.includes("bank") || title.includes("bank"));
        if (key === "prev_itr") return (id.includes("prev") || icon.includes("prev") || title.includes("previous"));
        if (key === "tds_certs") return (id.includes("tds_cert") || icon.includes("tds_cert") || title.includes("tds cert") || title.includes("deduction"));
        if (key === "income_proofs") return (id.includes("income") || icon.includes("income") || title.includes("income") || title.includes("supporting"));

        return false;
      });

      const targetUri = doc?.fileUri || (doc as any)?.uri;
      if (!doc || !targetUri) return null;
      return await readFileAsBase64(targetUri);
    };

    const [panFile, form16File, form16aFile, aisFile, tisFile, bankStatementsFile, prevItrFile, tdsCertsFile, incomeProofsFile] = await Promise.all([
      getDocBase64("pan"), getDocBase64("form16"), getDocBase64("form16a"), getDocBase64("ais"), getDocBase64("tis"), getDocBase64("bank_statements"), getDocBase64("prev_itr"), getDocBase64("tds_certs"), getDocBase64("income_proofs"),
    ]);

    const payload: TdsDocumentsDto = {
      tdsRefundId, panFile, form16File, form16aFile, aisFile, tisFile, bankStatementsFile, prevItrFile, tdsCertsFile, incomeProofsFile,
    };

    const existing = await tdsDocumentsApiService.getDocuments(tdsRefundId);
    if (existing && existing.id) {
      return await apiClient.put<string>("/itr/tds-documents/update/" + existing.id, payload);
    }
    return await apiClient.post<string>("/itr/tds-documents/save", payload);
  },

  getDocuments: async (tdsRefundId: string): Promise<TdsDocumentsDto | null> => {
    try {
      return await apiClient.get<TdsDocumentsDto>(`/itr/tds-documents/${tdsRefundId}`);
    } catch {
      return null;
    }
  },

  fetchAndMapDocumentsList: async (tdsRefundId: string, fallbackDocs: TdsDocumentItem[] = INITIAL_TDS_DOCUMENTS): Promise<TdsDocumentItem[]> => {
    const fetched = await tdsDocumentsApiService.getDocuments(tdsRefundId);
    if (!fetched) return fallbackDocs;

    const fileMap: Record<string, string | null | undefined> = {
      pan: fetched.panFile, form16: fetched.form16File, form16a: fetched.form16aFile, ais: fetched.aisFile, tis: fetched.tisFile, bank_statements: fetched.bankStatementsFile, prev_itr: fetched.prevItrFile, tds_certs: fetched.tdsCertsFile, income_proofs: fetched.incomeProofsFile,
    };

    return fallbackDocs.map((doc): TdsDocumentItem => {
      const base64Content = fileMap[doc.id];
      if (base64Content && base64Content.length > 0) {
        const mimeType = doc.allowedExtensions && doc.allowedExtensions.includes("pdf") ? "application/pdf" : "image/jpeg";
        const fileUri = base64Content.startsWith("data:") ? base64Content : `data:${mimeType};base64,${base64Content}`;

        return {
          ...doc,
          status: "uploaded",
          fileUri,
          fileName: `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}_uploaded.pdf`,
          fileSize: `${Math.round((base64Content.length * 3) / 4 / 1024)} KB`,
          mimeType,
        };
      }
      return doc;
    });
  },
};
