import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

/** A picked image with the real metadata reported by the picker. */
export interface PickedImageAsset {
  uri: string;
  fileName?: string;
  /** Size in bytes, when the platform reports it. */
  fileSize?: number;
  mimeType?: string;
}

const toAsset = (asset: ImagePicker.ImagePickerAsset): PickedImageAsset => ({
  uri: asset.uri,
  fileName: asset.fileName || undefined,
  fileSize: asset.fileSize,
  mimeType: asset.mimeType || "image/jpeg",
});

export const pickImageAssetFromGallery = async (
  allowsEditing: boolean = false,
): Promise<PickedImageAsset | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant photo gallery permissions to upload documents.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return toAsset(result.assets[0]);
    }
  } catch {
    Alert.alert("Gallery Error", "Unable to open gallery. Please try again.");
  }
  return null;
};

export const pickImageAssetFromCamera = async (
  allowsEditing: boolean = false,
): Promise<PickedImageAsset | null> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera permissions to capture documents.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return toAsset(result.assets[0]);
    }
  } catch {
    Alert.alert("Camera Error", "Unable to open camera. Please try again.");
  }
  return null;
};

/** Existing API (URI only), kept for current callers. */
export const pickImageFromGallery = async (allowsEditing: boolean = false): Promise<string | null> =>
  (await pickImageAssetFromGallery(allowsEditing))?.uri ?? null;

/** Existing API (URI only), kept for current callers. */
export const pickImageFromCamera = async (allowsEditing: boolean = false): Promise<string | null> =>
  (await pickImageAssetFromCamera(allowsEditing))?.uri ?? null;
