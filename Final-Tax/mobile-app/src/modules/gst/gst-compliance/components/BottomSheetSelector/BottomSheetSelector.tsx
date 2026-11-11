import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/hooks/useTheme";
import {
  styles,
  getSheetThemeStyle,
  getHandleThemeStyle,
  getHeaderTitleThemeStyle,
  getOptionRowThemeStyle,
  getIconBoxThemeStyle,
  getOptionLabelThemeStyle,
  getOptionSubtitleThemeStyle,
  getEmptyCircleThemeStyle,
  getCancelBtnThemeStyle,
  getCancelTextThemeStyle,
} from "@/modules/gst/gst-compliance/components/BottomSheetSelector/BottomSheetSelector.styles";

export interface SelectorOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  isDestructive?: boolean;
}

export interface BottomSheetSelectorProps {
  visible: boolean;
  title: string;
  options: SelectorOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  showCancel?: boolean;
  cancelText?: string;
}

export const BottomSheetSelector: React.FC<BottomSheetSelectorProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  showCancel = true,
  cancelText = "Cancel",
}) => {
  const { isDark } = useTheme();

  if (!visible) return null;

  const closeIconColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheetContainer, getSheetThemeStyle(isDark)]}>
              {/* Drag Handle */}
              <View style={styles.handleWrap}>
                <View style={[styles.handle, getHandleThemeStyle(isDark)]} />
              </View>

              {/* Title Bar */}
              <View style={styles.header}>
                <Text style={[styles.headerTitle, getHeaderTitleThemeStyle(isDark)]}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={22} color={closeIconColor} />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <ScrollView
                style={styles.scrollList}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {options.map((option, index) => {
                  const isSelected = selectedValue === option.value;
                  const isDestructive = option.isDestructive;
                  const optionIconColor = isSelected
                    ? "#FFFFFF"
                    : isDestructive
                    ? "#EF4444"
                    : isDark
                    ? "#94A3B8"
                    : "#083B75";

                  return (
                    <TouchableOpacity
                      key={`${option.value}-${index}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelect(option.value);
                        onClose();
                      }}
                      style={[
                        styles.optionRow,
                        getOptionRowThemeStyle(isSelected, isDark),
                      ]}
                    >
                      <View style={styles.optionLeft}>
                        {option.icon && (
                          <View
                            style={[
                              styles.iconBox,
                              getIconBoxThemeStyle(isSelected, isDark),
                            ]}
                          >
                            <Ionicons
                              name={option.icon}
                              size={18}
                              color={optionIconColor}
                            />
                          </View>
                        )}
                        <View style={styles.textWrap}>
                          <Text
                            style={[
                              styles.optionLabel,
                              getOptionLabelThemeStyle(isSelected, isDestructive, isDark),
                            ]}
                          >
                            {option.label}
                          </Text>
                          {option.subtitle && (
                            <Text
                              style={[
                                styles.optionSubtitle,
                                getOptionSubtitleThemeStyle(isDark),
                              ]}
                            >
                              {option.subtitle}
                            </Text>
                          )}
                        </View>
                      </View>

                      {isSelected ? (
                        <View style={styles.checkCircle}>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                          />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.emptyCircle,
                            getEmptyCircleThemeStyle(isDark),
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Cancel Button */}
              {showCancel && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={[styles.cancelBtn, getCancelBtnThemeStyle(isDark)]}
                >
                  <Text
                    style={[styles.cancelText, getCancelTextThemeStyle(isDark)]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
