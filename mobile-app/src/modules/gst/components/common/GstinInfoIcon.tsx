import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { styles, TOOLTIP_WIDTH } from "./GstinInfoIcon.styles";

export type GstInfoFieldType = "gstin" | "tradeName" | "sacCode" | "noticeNumber";

export interface GstFieldMessage {
  title: string;
  text: string;
}

export const GST_FIELD_MESSAGES: Record<GstInfoFieldType, GstFieldMessage> = {
  gstin: {
    title: "GSTIN Information",
    text: "Enter your valid 15-digit GST Identification Number. Ensure it matches your GST registration.",
  },
  tradeName: {
    title: "Trade Name Information",
    text: "Enter your business's commonly known trade name. It may differ from your legal name.",
  },
  sacCode: {
    title: "SAC Code Information",
    text: "Select the appropriate SAC code for your business services. It classifies services under GST.",
  },
  noticeNumber: {
    title: "Notice Number Information",
    text: "Enter the reference number mentioned in your GST department notice. Verify it before submitting.",
  },
};

export const GSTIN_TOOLTIP_TEXT = GST_FIELD_MESSAGES.gstin.text;
export const TRADE_NAME_TOOLTIP_TEXT = GST_FIELD_MESSAGES.tradeName.text;
export const SAC_CODE_TOOLTIP_TEXT = GST_FIELD_MESSAGES.sacCode.text;
export const NOTICE_NUMBER_TOOLTIP_TEXT = GST_FIELD_MESSAGES.noticeNumber.text;

const AUTO_DISMISS_DELAY_MS = 4000;

export interface GstinInfoIconProps {
  /** Field type identifier to select predefined title and text (defaults to "gstin") */
  fieldType?: GstInfoFieldType;
  /** Custom tooltip text override (if provided, overrides predefined fieldType text) */
  text?: string;
  /** Custom tooltip title override (if provided, overrides predefined fieldType title) */
  title?: string;
  /** Optional container style for positioning fine-tuning */
  style?: StyleProp<ViewStyle>;
  /** Optional icon size override (defaults to 16) */
  size?: number;
  /** Optional icon color override (defaults to BrandColors.PRIMARY_BLUE_ACCENT #0B5ED7) */
  color?: string;
  /**
   * Optional placement preference relative to the GSTIN field:
   * - "below-label": Anchored directly below the GSTIN label / icon (default)
   * - "below-input": Positioned below the input field so the input itself is uncovered
   */
  placement?: "below-label" | "below-input";
}

interface AnchoredLayout {
  popoverLeft: number;
  arrowLeft: number;
  isAbove: boolean;
  offsetY: number;
}

export const GstinInfoIcon: React.FC<GstinInfoIconProps> = ({
  fieldType = "gstin",
  text,
  title,
  style,
  size = 16,
  color = BrandColors.PRIMARY_BLUE_ACCENT,
  placement = "below-label",
}) => {
  const activeConfig = GST_FIELD_MESSAGES[fieldType] || GST_FIELD_MESSAGES.gstin;
  const tooltipTitle = title || activeConfig.title;
  const tooltipText = text || activeConfig.text;

  const [visible, setVisible] = useState<boolean>(false);
  const [layout, setLayout] = useState<AnchoredLayout>({
    popoverLeft: -120,
    arrowLeft: 120,
    isAbove: false,
    offsetY: 26,
  });
  const iconRef = useRef<TouchableOpacityInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideTooltip = useCallback(() => {
    clearDismissTimer();
    setVisible(false);
  }, [clearDismissTimer]);

  useEffect(() => {
    return () => {
      clearDismissTimer();
    };
  }, [clearDismissTimer]);

  const showTooltip = useCallback(() => {
    if (visible) {
      hideTooltip();
      return;
    }

    clearDismissTimer();

    if (iconRef.current && typeof iconRef.current.measureInWindow === "function") {
      iconRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const screenWidth = Dimensions.get("window").width;
        const screenHeight = Dimensions.get("window").height;

        const effectiveWidth = width || size || 16;
        const effectiveHeight = height || size || 16;

        // Intelligent boundary check: only position above if insufficient space below
        const spaceBelow = screenHeight - (y + effectiveHeight);
        const shouldBeAbove = spaceBelow < 150 && y > 150;

        // Horizontal positioning: align with icon center and clamp within screen margins (16px)
        const iconCenterX = x + effectiveWidth / 2;
        const idealScreenLeft = iconCenterX - TOOLTIP_WIDTH / 2;
        const clampedScreenLeft = Math.max(
          16,
          Math.min(idealScreenLeft, screenWidth - TOOLTIP_WIDTH - 16)
        );

        // Tooltip bubble's left relative to the field container
        const relativeLeft = clampedScreenLeft - x;

        // Caret arrow position on the bubble pointing directly to the center of the icon
        const arrowCenter = iconCenterX - clampedScreenLeft;
        const arrowLeft = Math.max(12, Math.min(arrowCenter - 7, TOOLTIP_WIDTH - 26));

        const baseOffset =
          placement === "below-input"
            ? effectiveHeight + 56
            : effectiveHeight + 8;

        setLayout({
          popoverLeft: relativeLeft,
          arrowLeft,
          isAbove: shouldBeAbove,
          offsetY: baseOffset,
        });
        setVisible(true);

        timerRef.current = setTimeout(() => {
          setVisible(false);
          timerRef.current = null;
        }, AUTO_DISMISS_DELAY_MS);
      });
    } else {
      setLayout({
        popoverLeft: -120,
        arrowLeft: 120,
        isAbove: false,
        offsetY: (size || 16) + 8,
      });
      setVisible(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, AUTO_DISMISS_DELAY_MS);
    }
  }, [visible, size, placement, clearDismissTimer, hideTooltip]);

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
        accessibilityLabel={tooltipTitle}
        accessibilityHint={`Tap to view ${tooltipTitle}`}
      >
        <Ionicons name="information-circle-outline" size={size} color={color} />
      </TouchableOpacity>

      {visible && (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={hideTooltip}
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${tooltipTitle}`}
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
              <Text style={styles.tooltipTitle}>{tooltipTitle}</Text>
              <TouchableOpacity
                onPress={hideTooltip}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel={`Close ${tooltipTitle}`}
              >
                <Ionicons name="close" size={15} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.tooltipText}>{tooltipText}</Text>
          </View>
        </>
      )}
    </View>
  );
};

export const GstInfoIcon = GstinInfoIcon;
export type GstInfoIconProps = GstinInfoIconProps;
