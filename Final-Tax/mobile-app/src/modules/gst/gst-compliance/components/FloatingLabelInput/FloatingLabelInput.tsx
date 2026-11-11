import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Animated,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/hooks/useTheme";
import { BrandColors } from "@/shared/theme";
import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";
import {
  styles,
  getInputContainerDynamicStyle,
  getTextInputDynamicStyle,
} from "@/modules/gst/gst-compliance/components/FloatingLabelInput/FloatingLabelInput.styles";

export interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  floatingLabel?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  containerStyle?: any;
  cardBackground?: string;
  rightElement?: React.ReactNode;
  labelRightElement?: React.ReactNode;
  onClear?: () => void;
  onFocusScroll?: () => void;
  showCharCount?: boolean;
  maxLength?: number;
  labelAbove?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  floatingLabel,
  placeholder,
  required = false,
  error,
  value = "",
  containerStyle,
  cardBackground,
  rightElement,
  labelRightElement,
  onClear,
  onFocusScroll,
  multiline = false,
  numberOfLines = 1,
  showCharCount = false,
  maxLength,
  labelAbove = false,
  onFocus,
  onBlur,
  onChangeText,
  style,
  ...rest
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    const cleaned = removeEmoji(text);
    if (onChangeText) onChangeText(cleaned);
  };

  const hasValue = Boolean(value && value.toString().length > 0);

  // Animated value: 0 when empty & unfocused, 1 when focused or has content
  const [animatedValue] = useState(() => new Animated.Value(hasValue ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, animatedValue]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
    if (onFocusScroll) {
      setTimeout(() => {
        onFocusScroll();
      }, 100);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Interpolated values for smooth 180ms transition
  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [multiline ? 16 : 14, -10],
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [14.5, 11.5],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? "#64748B" : "#94A3B8",
      error
        ? "#EF4444"
        : isFocused
        ? BrandColors.PRIMARY_ORANGE
        : isDark
        ? "#94A3B8"
        : "#64748B",
    ],
  });

  const defaultBg = isDark ? "#1E293B" : "#FFFFFF";
  const bg = cardBackground || defaultBg;

  // Border color based on state
  const borderColor = error
    ? "#EF4444"
    : isFocused
    ? BrandColors.PRIMARY_ORANGE
    : isDark
    ? "#334155"
    : "#CBD5E1";

  // Label text: shows floatingLabel (or label) when elevated, label (or floatingLabel) when resting inside
  const elevatedLabelText = floatingLabel || label;
  const restingLabelText = label || floatingLabel || placeholder;
  const currentLabelText = isFocused || hasValue ? elevatedLabelText : restingLabelText;

  const animatedWrapperStyle = {
    top: labelTop,
    backgroundColor: bg,
  };

  const animatedTextStyle = {
    fontSize: labelFontSize,
    color: labelColor,
    fontWeight: (isFocused || hasValue ? "700" : "500") as "700" | "500",
  };

  const clearIconColor = isDark ? "#64748B" : "#94A3B8";

  return (
    <View style={[styles.rootContainer, containerStyle]}>
      {labelAbove && (label || floatingLabel) && (
        <View style={styles.labelRow}>
          <Text style={[styles.labelAboveText, isDark && styles.labelAboveTextDark]}>
            {label || floatingLabel}
            {required ? <Text style={styles.star}> *</Text> : null}
          </Text>
          {labelRightElement}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          getInputContainerDynamicStyle(
            bg,
            borderColor,
            isFocused,
            Boolean(error),
            multiline,
            numberOfLines
          ),
        ]}
      >
        {/* Floating Label with background cutout notch (only when labelAbove is false) */}
        {!labelAbove && (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.floatingLabelWrapper,
              animatedWrapperStyle,
              Boolean(labelRightElement) && { flexDirection: "row", alignItems: "center", gap: 6 },
            ]}
          >
            <Animated.Text
              style={[styles.floatingLabelText, animatedTextStyle]}
            >
              {currentLabelText}
              {required ? <Text style={styles.star}> *</Text> : null}
            </Animated.Text>
            {labelRightElement}
          </Animated.View>
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          placeholder={labelAbove ? placeholder : (isFocused && !hasValue ? placeholder : undefined)}
          placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
          maxLength={showCharCount ? undefined : maxLength}
          style={[
            styles.textInput,
            getTextInputDynamicStyle(isDark, multiline),
            style,
          ]}
          {...rest}
        />

        {/* Right Element or Clear Button */}
        {rightElement ? (
          <View style={styles.rightElementWrap}>{rightElement}</View>
        ) : onClear && hasValue && isFocused ? (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearBtn}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={clearIconColor}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Helper Row: Inline Error on Left, Character Counter on Right */}
      {error || (showCharCount && typeof maxLength === "number") ? (
        <View style={styles.helperRow}>
          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={13} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.errorSpacer} />
          )}

          {showCharCount && typeof maxLength === "number" ? (
            <Text
              style={[
                styles.charCountText,
                isDark && styles.charCountTextDark,
                (value?.toString().length || 0) > maxLength && styles.charCountTextError,
              ]}
            >
              {value?.toString().length || 0}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
