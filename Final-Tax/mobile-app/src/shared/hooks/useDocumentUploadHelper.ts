import { useState, useCallback, useRef } from "react";
import { ScrollView, Alert, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export interface DocumentUploadResult {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface UseDocumentUploadHelperOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  scrollRef?: React.RefObject<ScrollView | null>;
  /**
   * Show the native crop/rotate editor after a photo is taken or picked.
   * On Android this is a free-form document cropper that bakes the crop and
   * rotation into the saved file. (On iOS the native editor only supports a
   * square crop, so callers usually enable this for Android only.)
   */
  allowsEditing?: boolean;
  onSuccess?: (result: DocumentUploadResult, docKey?: string) => void;
  onError?: (error: string, docKey?: string) => void;
  /** Called when a picker/camera is launched for `docKey` (processing state). */
  onProcessingStart?: (docKey?: string) => void;
  /** Called when the user backs out of the picker/camera without choosing a file. */
  onCancel?: (docKey?: string) => void;
}

const PERMISSION_MESSAGES = {
  camera: "Please allow camera access to take document photos.",
  gallery: "Please allow gallery access to select document photos.",
};

export function useDocumentUploadHelper({
  maxSizeMB = 10,
  allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"],
  scrollRef,
  allowsEditing = false,
  onSuccess,
  onError,
  onProcessingStart,
  onCancel,
}: UseDocumentUploadHelperOptions = {}) {
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [currentDocTitle, setCurrentDocTitle] = useState<string>("");
  // The document a picker was opened for. Kept in a ref so a result that
  // arrives later is always applied to the document that requested it.
  const activeDocKeyRef = useRef<string | null>(null);
  const isPickingRef = useRef(false);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const scrollToTarget = useCallback((targetY?: number) => {
    if (scrollRef?.current && typeof targetY === "number") {
      scrollRef.current.scrollTo({ y: Math.max(0, targetY - 40), animated: true });
    }
  }, [scrollRef]);

  const openUploadSheet = useCallback((docKey: string, title?: string, targetY?: number) => {
    activeDocKeyRef.current = docKey;
    setActiveDocKey(docKey);
    setCurrentDocTitle(title || docKey);
    setIsSheetVisible(true);
    if (typeof targetY === "number") {
      scrollToTarget(targetY);
    }
  }, [scrollToTarget]);

  const closeUploadSheet = useCallback(() => {
    setIsSheetVisible(false);
    setActiveDocKey(null);
  }, []);

  const reportError = useCallback((message: string, docKey?: string) => {
    if (onError) onError(message, docKey);
    else Alert.alert("Upload Error", message);
  }, [onError]);

  const validateAndProcessFile = useCallback((
    file: { uri: string; name: string; size?: number; mimeType?: string },
    docKey?: string,
  ) => {
    if (file.size === 0) {
      const msg = "This file appears to be empty. Please choose another file.";
      if (onError) onError(msg, docKey);
      else Alert.alert("Invalid File", msg);
      return false;
    }

    if (file.size === undefined || !Number.isFinite(file.size) || file.size < 0) {
      const msg = "The file size could not be verified. Please choose another file.";
      if (onError) onError(msg, docKey);
      else Alert.alert("Invalid File", msg);
      return false;
    }

    if (file.size > maxSizeBytes) {
      const msg = `File size exceeds maximum limit of ${maxSizeMB}MB.`;
      if (onError) onError(msg, docKey);
      else Alert.alert("File Too Large", msg);
      return false;
    }

    if (onSuccess) {
      onSuccess(file, docKey);
    }
    closeUploadSheet();
    return true;
  }, [maxSizeBytes, maxSizeMB, onError, onSuccess, closeUploadSheet]);

  /**
   * Runs one picker for the active document: marks it as processing, handles
   * cancel/permission/errors, and ignores re-entrant taps while a picker is open.
   */
  const runPicker = useCallback(async (
    launch: () => Promise<{ file: DocumentUploadResult | null }>,
    fallbackError: string,
  ) => {
    if (isPickingRef.current) return;
    isPickingRef.current = true;
    const docKey = activeDocKeyRef.current || undefined;
    onProcessingStart?.(docKey);
    try {
      const { file } = await launch();
      if (file) {
        validateAndProcessFile(file, docKey);
      } else {
        onCancel?.(docKey);
      }
    } catch (e) {
      onCancel?.(docKey);
      reportError(getErrorMessage(e) || fallbackError, docKey);
    } finally {
      isPickingRef.current = false;
    }
  }, [onProcessingStart, onCancel, validateAndProcessFile, reportError]);

  const ensurePermission = useCallback(async (kind: "camera" | "gallery"): Promise<boolean> => {
    const perm = kind === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.granted) return true;
    Alert.alert(
      "Permission Required",
      PERMISSION_MESSAGES[kind],
      perm.canAskAgain
        ? [{ text: "OK" }]
        : [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => { Linking.openSettings().catch(() => {}); } },
          ],
    );
    return false;
  }, []);

  const pickFiles = useCallback(async () => {
    await runPicker(async () => {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets || res.assets.length === 0) return { file: null };
      const asset = res.assets[0];
      return {
        file: { uri: asset.uri, name: asset.name, size: asset.size, mimeType: asset.mimeType },
      };
    }, "Failed to pick file");
  }, [runPicker]);

  const pickGallery = useCallback(async () => {
    await runPicker(async () => {
      if (!(await ensurePermission("gallery"))) return { file: null };
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing,
      });
      if (res.canceled || !res.assets || res.assets.length === 0) return { file: null };
      const asset = res.assets[0];
      return {
        file: {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || "image/jpeg",
        },
      };
    }, "Failed to select photo");
  }, [runPicker, ensurePermission, allowsEditing]);

  const takePhoto = useCallback(async () => {
    await runPicker(async () => {
      if (!(await ensurePermission("camera"))) return { file: null };
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing,
      });
      if (res.canceled || !res.assets || res.assets.length === 0) return { file: null };
      const asset = res.assets[0];
      return {
        file: {
          uri: asset.uri,
          name: asset.fileName || `camera_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || "image/jpeg",
        },
      };
    }, "Failed to take photo");
  }, [runPicker, ensurePermission, allowsEditing]);

  return {
    isSheetVisible,
    activeDocKey,
    currentDocTitle,
    openUploadSheet,
    closeUploadSheet,
    pickFiles,
    pickGallery,
    takePhoto,
    scrollToTarget,
    allowedMimeTypes,
  };
}

export default useDocumentUploadHelper;
