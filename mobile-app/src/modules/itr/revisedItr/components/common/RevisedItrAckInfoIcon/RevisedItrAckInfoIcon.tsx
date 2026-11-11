import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  type TouchableOpacityInstance,
  Pressable,
  Dimensions,
  StyleProp,
  ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles, TOOLTIP_WIDTH } from "./RevisedItrAckInfoIcon.styles";

export interface RevisedItrAckInfoIconProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
  title?: string;
  text?: string;
}

interface AnchoredLayout {
  popoverLeft: number;
  arrowLeft: number;
  isAbove: boolean;
  offsetY: number;
}

const DEFAULT_TITLE = "Acknowledgement Number Info";
const DEFAULT_TEXT =
  "Enter the 15-digit acknowledgement number found on your previously filed ITR-V (Acknowledgement receipt) or the Income Tax e-Filing portal for the selected Assessment Year.";

export const RevisedItrAckInfoIcon: React.FC<RevisedItrAckInfoIconProps> = ({
  style,
  size = 17,
  color = BrandColors.PRIMARY_BLUE_ACCENT || "#0B5ED7",
  title = DEFAULT_TITLE,
  text = DEFAULT_TEXT,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [layout, setLayout] = useState<AnchoredLayout>({
    popoverLeft: -120,
    arrowLeft: 120,
    isAbove: false,
    offsetY: 26,
  });
  const iconRef = useRef<TouchableOpacityInstance | null>(null);

  const hideTooltip = useCallback(() => {
    setVisible(false);
  }, []);

  const showTooltip = useCallback(() => {
    if (visible) {
      hideTooltip();
      return;
    }

    if (iconRef.current && typeof iconRef.current.measureInWindow === "function") {
      iconRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const screenWidth = Dimensions.get("window").width;
        const screenHeight = Dimensions.get("window").height;

        const effectiveWidth = width || size || 16;
        const effectiveHeight = height || size || 16;

        const spaceBelow = screenHeight - (y + effectiveHeight);
        const shouldBeAbove = spaceBelow < 150 && y > 150;

        const iconCenterX = x + effectiveWidth / 2;
        const idealScreenLeft = iconCenterX - TOOLTIP_WIDTH / 2;
        const clampedScreenLeft = Math.max(
          16,
          Math.min(idealScreenLeft, screenWidth - TOOLTIP_WIDTH - 16)
        );

        const relativeLeft = clampedScreenLeft - x;
        const arrowCenter = iconCenterX - clampedScreenLeft;
        const arrowLeft = Math.max(12, Math.min(arrowCenter - 7, TOOLTIP_WIDTH - 26));

        setLayout({
          popoverLeft: relativeLeft,
          arrowLeft,
          isAbove: shouldBeAbove,
          offsetY: effectiveHeight + 8,
        });
        setVisible(true);
      });
    } else {
      setLayout({
        popoverLeft: -120,
        arrowLeft: 120,
        isAbove: false,
        offsetY: (size || 16) + 8,
      });
      setVisible(true);
    }
  }, [visible, size, hideTooltip]);

  return (
    <View
      style={[styles.container, visible && { zIndex: 1000 }, style]}
      collapsable={false}
    >
      <TouchableOpacity
        ref={iconRef}
        onPress={showTooltip}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={`Tap to view ${title}`}
      >
        <Ionicons name="information-circle-outline" size={size} color={color} />
      </TouchableOpacity>

      {visible && (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={hideTooltip}
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${title}`}
          />
          <View
            style={[
              styles.tooltipBubble,
              layout.isAbove ? { bottom: layout.offsetY } : { top: layout.offsetY },
              { left: layout.popoverLeft, width: TOOLTIP_WIDTH },
            ]}
          >
            <View
              style={[
                layout.isAbove ? styles.arrowDown : styles.arrowUp,
                { left: layout.arrowLeft },
              ]}
            />
            <View style={styles.tooltipHeader}>
              <Ionicons
                name="information-circle"
                size={16}
                color="#38BDF8"
                style={styles.tooltipHeaderIcon}
              />
              <Text style={styles.tooltipTitle}>{title}</Text>
              <TouchableOpacity
                onPress={hideTooltip}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel={`Close ${title}`}
              >
                <Ionicons name="close" size={15} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.tooltipText}>{text}</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default RevisedItrAckInfoIcon;
