import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandColors } from "@/shared/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface DocumentCropModalProps {
  visible: boolean;
  imageUri: string | null;
  onDone: (uri: string) => void;
  onCancel: () => void;
}

export const DocumentCropModal: React.FC<DocumentCropModalProps> = ({
  visible,
  imageUri,
  onDone,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDone = () => {
    if (imageUri) {
      onDone(imageUri);
    }
  };

  if (!visible || !imageUri) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

        {/* Top Action Bar (Matching Image 2 with 'Done' on top right) */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={onCancel}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.centerActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleRotate}>
              <Ionicons name="reload-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.iconBtn}>
              <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
            </View>
          </View>

          <TouchableOpacity style={styles.doneBtn} activeOpacity={0.8} onPress={handleDone}>
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>

        {/* Middle Crop Viewport (Matching Image 2 framing box) */}
        <View style={styles.cropViewport}>
          <View style={styles.cropFrame}>
            {/* Corner Crop Indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Document Image */}
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.cropImage,
                { transform: [{ rotate: `${rotation}deg` }] },
              ]}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Hint */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={styles.hintText}>Adjust crop area and tap DONE to confirm</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B132B",
  },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#0B132B",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  backBtn: {
    padding: 6,
  },
  centerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  iconBtn: {
    padding: 6,
  },
  doneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  cropViewport: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cropFrame: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.65,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.85)",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderRadius: 4,
    overflow: "hidden",
  },
  cropImage: {
    width: "100%",
    height: "100%",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#FFFFFF",
    zIndex: 10,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomBar: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#0B132B",
  },
  hintText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
});
