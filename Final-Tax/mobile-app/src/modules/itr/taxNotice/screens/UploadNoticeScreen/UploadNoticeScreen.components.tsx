import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./UploadNoticeScreen.styles";
import { NOTICE_TYPE_OPTIONS } from "../../mock/taxNoticeData";

export const ayOptions = [
  "AY 2027-28",
  "AY 2026-27",
  "AY 2025-26",
  "AY 2024-25",
  "AY 2023-24",
  "AY 2022-23",
  "Other"
];

interface AyDropdownProps {
  formData: any;
  errors: any;
  handleFieldChange: (field: any, value: string) => void;
  showOtherAyInput: boolean;
  setShowOtherAyInput: (val: boolean) => void;
  showAyDropdown: boolean;
  setShowAyDropdown: (val: boolean) => void;
}

export const AssessmentYearDropdown: React.FC<AyDropdownProps> = ({
  formData,
  errors,
  handleFieldChange,
  showOtherAyInput,
  setShowOtherAyInput,
  showAyDropdown,
  setShowAyDropdown,
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        Assessment Year (AY) <Text style={styles.requiredStar}>*</Text>
      </Text>
      {showOtherAyInput ? (
        <View style={[styles.textInput, { flexDirection: "row", alignItems: "center", paddingRight: 8 }, errors.assessmentYear ? styles.inputError : null]}>
          <TextInput
            style={{ flex: 1, color: "#0F172A", fontSize: 16, height: 48 }}
            placeholder="E.g., AY 2028-29"
            placeholderTextColor="#94A3B8"
            value={formData.assessmentYear}
            maxLength={10}
              onChangeText={(text) => handleFieldChange("assessmentYear", text.toUpperCase())}
            autoFocus
          />
          <TouchableOpacity onPress={() => { setShowOtherAyInput(false); handleFieldChange("assessmentYear", ""); }}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowAyDropdown(!showAyDropdown)}
            style={[styles.dropdownSelector, errors.assessmentYear ? styles.inputError : null]}
          >
            <Text style={[styles.dropdownValue, !formData.assessmentYear && { color: "#94A3B8" }]}>{formData.assessmentYear || "Select Assessment Year"}</Text>
            <Ionicons
              name={showAyDropdown ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {showAyDropdown && (
            <View style={styles.dropdownMenu}>
              {ayOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (opt === "Other") { 
                      setShowOtherAyInput(true); 
                      handleFieldChange("assessmentYear", ""); 
                    } else { 
                      setShowOtherAyInput(false); 
                      handleFieldChange("assessmentYear", opt); 
                    }
                    setShowAyDropdown(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      formData.assessmentYear === opt
                        ? styles.dropdownItemActive
                        : null,
                    ]}
                  >
                    {opt}
                  </Text>
                  {formData.assessmentYear === opt && (
                    <Ionicons name="checkmark" size={16} color="#F97316" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

interface NoticeTypeDropdownProps {
  formData: any;
  errors: any;
  handleFieldChange: (field: any, value: string) => void;
  showTypeDropdown: boolean;
  setShowTypeDropdown: (val: boolean) => void;
}

export const NoticeTypeDropdown: React.FC<NoticeTypeDropdownProps> = ({
  formData,
  errors,
  handleFieldChange,
  showTypeDropdown,
  setShowTypeDropdown,
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        Notice Type / Section <Text style={styles.requiredStar}>*</Text>
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowTypeDropdown(!showTypeDropdown)}
        style={[
          styles.dropdownSelector,
          errors.noticeType ? styles.inputError : null,
        ]}
      >
        <Text
          style={[
            styles.dropdownValue,
            !formData.noticeType ? { color: "#94A3B8" } : null,
          ]}
          numberOfLines={1}
        >
          {formData.noticeType || "Select Notice Type"}
        </Text>
        <Ionicons
          name={showTypeDropdown ? "chevron-up" : "chevron-down"}
          size={18}
          color="#64748B"
        />
      </TouchableOpacity>

      {showTypeDropdown && (
        <View style={styles.dropdownMenu}>
          {NOTICE_TYPE_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item.value}
              activeOpacity={0.7}
              onPress={() => {
                handleFieldChange("noticeType", item.label);
                setShowTypeDropdown(false);
              }}
              style={styles.dropdownItem}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    formData.noticeType === item.label
                      ? styles.dropdownItemActive
                      : null,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {item.description}
                </Text>
              </View>
              {formData.noticeType === item.label && (
                <Ionicons name="checkmark" size={16} color="#F97316" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      {errors.noticeType ? (
        <Text style={styles.errorText}>{errors.noticeType}</Text>
      ) : null}
    </View>
  );
};
