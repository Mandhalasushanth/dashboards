import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  type KeyboardTypeOptions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";
import { styles } from "./GstBusinessStep.styles";
 
interface InputProps {
  label: string;
  value: string;
  field?: string;
  onChange?: (val: string) => void;
  onChangeField?: (field: string, val: string) => void;
  onBlur?: () => void;
  onBlurField?: (field: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  accessibilityLabel?: string;
  accessibilityHint?: string;
  inputRef?: (node: TextInput | null) => void;
  infoIcon?: React.ReactNode;
}
 
export const FormInput: React.FC<InputProps> = React.memo(({
  label,
  value,
  field,
  onChange,
  onChangeField,
  onBlur,
  onBlurField,
  error,
  placeholder,
  keyboardType,
  maxLength,
  autoCapitalize,
  accessibilityLabel,
  accessibilityHint,
  inputRef,
  infoIcon,
}) => {
  const handleChangeText = (text: string) => {
    const cleaned = removeEmoji(text);
    if (onChangeField && field) onChangeField(field, cleaned);
    else onChange?.(cleaned);
  };
  const handleBlur = () => {
    if (onBlurField && field) onBlurField(field);
    else onBlur?.();
  };

  return (
    <View style={styles.fieldGroup}>
      {infoIcon ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { marginBottom: 0 }]}>
            {label.endsWith(" *") ? (
              <>
                {label.slice(0, -2)} <Text style={styles.star}>*</Text>
              </>
            ) : label.endsWith("*") ? (
              <>
                {label.slice(0, -1).trim()} <Text style={styles.star}>*</Text>
              </>
            ) : (
              label
            )}
          </Text>
          {infoIcon}
        </View>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        ref={inputRef}
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={accessibilityLabel || label.replace(" *", "")}
        accessibilityHint={accessibilityHint || (placeholder ? `Enter ${placeholder}` : undefined)}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});
FormInput.displayName = "FormInput";
 
interface SelectProps {
  label: string;
  value: string;
  field?: string;
  options: string[];
  onChange?: (val: string) => void;
  onSelectField?: (field: string, val: string) => void;
  error?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
 
export const FormSelect: React.FC<SelectProps> = React.memo(({
  label,
  value,
  field,
  options,
  onChange,
  onSelectField,
  error,
  placeholder,
  searchable = false,
  searchPlaceholder = "Search...",
  allowCustom = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (item: string) => {
    if (onSelectField && field) onSelectField(field, item);
    else onChange?.(item);
    setSearchQuery("");
    setModalVisible(false);
  };

  const handleCustomSubmit = () => {
    const clean = searchQuery.trim();
    if (!clean) return;
    if (onSelectField && field) onSelectField(field, clean);
    else onChange?.(clean);
    setSearchQuery("");
    setModalVisible(false);
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.trim().toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(query));
  }, [options, searchable, searchQuery]);

  const exactMatchExists = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return options.some((opt) => opt.toLowerCase() === query);
  }, [options, searchQuery]);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setSearchQuery("");
          setModalVisible(true);
        }}
        style={[styles.selectInput, error && styles.inputError]}
        accessibilityRole="combobox"
        accessibilityLabel={accessibilityLabel || label.replace(" *", "")}
        accessibilityHint={accessibilityHint || "Double tap to select an option"}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#1E293B" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
 
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setSearchQuery("");
            setModalVisible(false);
          }}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {label.replace(" *", "")}
              </Text>
              {searchable && (
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={(val) => setSearchQuery(removeEmoji(val))}
                  autoCapitalize="words"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
              )}
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      value === item && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        value === item && styles.modalOptionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {value === item && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={BrandColors.PRIMARY_BLUE}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  allowCustom && searchQuery.trim() && !exactMatchExists ? (
                    <TouchableOpacity
                      style={[styles.modalOption, { borderBottomWidth: 0, paddingVertical: 12 }]}
                      onPress={handleCustomSubmit}
                    >
                      <Text style={[styles.modalOptionText, { color: BrandColors.PRIMARY_ORANGE, fontWeight: "600" }]}>
                        Use &quot;{searchQuery.trim()}&quot;
                      </Text>
                      <Ionicons name="add-circle-outline" size={20} color={BrandColors.PRIMARY_ORANGE} />
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.modalEmptyText}>No matching options found</Text>
                  )
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});
FormSelect.displayName = "FormSelect";
 
interface DatePickerProps {
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
  placeholder?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
 
export const FormDatePicker: React.FC<DatePickerProps> = React.memo(({
  label,
  value,
  onPress,
  error,
  placeholder,
  accessibilityLabel,
  accessibilityHint,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.dateInput,
        styles.formDatePickerBtn,
        error && styles.inputError,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label.replace(" *", "")}
      accessibilityHint={accessibilityHint || "Double tap to select date"}
    >
      <Text
        style={[
          styles.selectText,
          styles.formDatePickerText,
          !value && styles.placeholderText,
        ]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Ionicons
        name="calendar-outline"
        size={18}
        color={error ? "#DC2626" : "#0284C7"}
      />
    </TouchableOpacity>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
));
FormDatePicker.displayName = "FormDatePicker";

interface SectionCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = React.memo(({ iconName, title, subtitle, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Ionicons name={iconName} size={18} color={BrandColors.PRIMARY_ORANGE} />
      </View>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionMainTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
    {children}
  </View>
));
SectionCard.displayName = "SectionCard";

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isExpanded: boolean;
  onToggle: () => void;
  errorCount?: number;
  children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = React.memo(
  ({ title, subtitle, iconName, isExpanded, onToggle, errorCount = 0, children }) => (
    <View style={[styles.accordionCard, isExpanded && styles.accordionCardExpanded]}>
      <TouchableOpacity
        style={styles.accordionCardHeader}
        activeOpacity={0.7}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isExpanded ? "expanded" : "collapsed"}${errorCount > 0 ? `, ${errorCount} error${errorCount > 1 ? "s" : ""}` : ""}`}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.sectionIconBox}>
            <Ionicons name={iconName} size={18} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.sectionMainTitle}>{title}</Text>
              {!isExpanded && errorCount > 0 && (
                <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: "#FCA5A5" }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#DC2626" }}>
                    {errorCount} {errorCount === 1 ? "error" : "errors"}
                  </Text>
                </View>
              )}
            </View>
            {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <View style={styles.accordionChevronBox}>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>
      {isExpanded && <View style={styles.accordionCardContent}>{children}</View>}
    </View>
  )
);
AccordionSection.displayName = "AccordionSection";

export function safeTransform(value: unknown, transformer: (val: string) => string): string {
  try {
    if (value === null || value === undefined) return "";
    return transformer(typeof value === "string" ? value : String(value));
  } catch {
    return typeof value === "string" ? value : "";
  }
}

export const sanitizeDigits = (val: string): string => safeTransform(val, (s) => s.replace(/\D/g, ""));
export const sanitizeAlphanumericUpper = (val: string): string => safeTransform(val, (s) => s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());