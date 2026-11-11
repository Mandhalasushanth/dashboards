import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { FormInput } from "@/shared/components/Input/FormInput";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { Result } from "@/shared/utils/functional";
import type { ApplicationFormData, FormField } from "@/shared/types/domain";

export type FormErrors = Record<string, string>;

export interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (values: ApplicationFormData) => void;
  submitButtonText?: string;
  initialValues?: ApplicationFormData;
}

export function DynamicForm({
  fields,
  onSubmit,
  submitButtonText = "Submit",
  initialValues = {},
}: DynamicFormProps) {
  const colors = useTheme();
  const [formValues, setFormValues] = useState<ApplicationFormData>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const [activeDropdownField, setActiveDropdownField] =
    useState<FormField | null>(null);
  const [showDropdownModal, setShowDropdownModal] = useState(false);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleDropdownSelect = (fieldName: string, option: string) => {
    handleInputChange(fieldName, option);
    setShowDropdownModal(false);
    setActiveDropdownField(null);
  };

  const openDropdown = (field: FormField) => {
    setActiveDropdownField(field);
    setShowDropdownModal(true);
  };

  const validateForm = (): Result<ApplicationFormData, FormErrors> => {
    const validationErrors = fields.reduce<FormErrors>((acc, field) => {
      const val = formValues[field.name];
      if (field.required && (!val || val.trim() === "")) {
        acc[field.name] = `${field.label} is required`;
      }
      return acc;
    }, {});

    return Object.keys(validationErrors).length === 0
      ? Result.success<ApplicationFormData, FormErrors>(formValues)
      : Result.failure<FormErrors, ApplicationFormData>(validationErrors);
  };

  const handleFormSubmit = () => {
    validateForm()
      .map((values) => {
        setErrors({});
        onSubmit(values);
        return values;
      })
      .getOrElse((validationErrors: FormErrors | null) => {
        setErrors(validationErrors ?? {});
        Alert.alert("Incomplete Form", "Please fill in all required fields.");
      });
  };

  return (
    <View style={styles.container}>
      {fields.map((field) => {
        const value = formValues[field.name] || "";
        const error = errors[field.name];

        if (field.type === "dropdown") {
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {field.label}{" "}
                {field.required && (
                  <Text style={{ color: colors.error }}>*</Text>
                )}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openDropdown(field)}
                style={[
                  styles.dropdownBox,
                  {
                    backgroundColor: colors.background,
                    borderColor: error ? colors.error : colors.border,
                  },
                ]}
              >
                <Text
                  style={{ color: value ? colors.text : colors.textSecondary }}
                >
                  {value || field.placeholder || "Select option"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}
            </View>
          );
        }

        if (field.type === "date") {
          return (
            <FormInput
              key={field.name}
              label={field.label}
              value={value}
              onChangeText={(text) => handleInputChange(field.name, text)}
              placeholder={field.placeholder || "YYYY-MM-DD"}
              required={field.required}
              error={error}
            />
          );
        }

        return (
          <FormInput
            key={field.name}
            label={field.label}
            value={value}
            onChangeText={(text) => handleInputChange(field.name, text)}
            placeholder={field.placeholder}
            keyboardType={field.type === "number" ? "numeric" : "default"}
            required={field.required}
            error={error}
          />
        );
      })}

      <PrimaryButton
        title={submitButtonText}
        onPress={handleFormSubmit}
        style={styles.submitBtn}
        colorType="orange"
      />

      <Modal
        visible={showDropdownModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdownModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select {activeDropdownField?.label}
            </Text>

            <ScrollView
              style={styles.optionsScroll}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {activeDropdownField?.options?.map((option, idx) => {
                const isSelected =
                  formValues[activeDropdownField.name] === option;
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() =>
                      handleDropdownSelect(activeDropdownField.name, option)
                    }
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: isSelected
                          ? colors.orangeLight
                          : "transparent",
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? colors.orange : colors.text,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.orange}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setShowDropdownModal(false);
                setActiveDropdownField(null);
              }}
              style={[styles.closeBtn, { borderTopColor: colors.border }]}
            >
              <Text
                style={[styles.closeBtnText, { color: colors.textSecondary }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  fieldContainer: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  dropdownBox: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  submitBtn: {
    marginTop: 12,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    maxHeight: 400,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    padding: 16,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 15,
  },
  closeBtn: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
  },
  closeBtnText: {
    fontWeight: "600",
    fontSize: 15,
  },
});

export default DynamicForm;
