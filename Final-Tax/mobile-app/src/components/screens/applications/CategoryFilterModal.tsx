import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.styles";

export interface CategoryFilterOption {
  id: string;
  label: string;
  filterKey: string;
}

export const CATEGORY_FILTER_OPTIONS: CategoryFilterOption[] = [
  { id: "ALL", label: "All", filterKey: "ALL" },
  { id: "GST_REG", label: "GST Registration", filterKey: "gst-registration" },
  { id: "GST_AMD", label: "GST Amendment", filterKey: "gst-amendment" },
  { id: "GST_FIL", label: "GST Filing", filterKey: "gst-filing" },
  { id: "ITR", label: "ITR & TDS", filterKey: "ITR" },
  { id: "LOANS", label: "Loans", filterKey: "LOANS" },
  { id: "BUSINESS", label: "Company Incorporation", filterKey: "BUSINESS" },
];

interface CategoryFilterModalProps {
  visible: boolean;
  selectedFilterKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

export function CategoryFilterModal({
  visible,
  selectedFilterKey,
  onSelect,
  onClose,
}: CategoryFilterModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.categoryModalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.categoryModalCard}>
          <Text style={styles.categoryModalTitle}>Filter by Service</Text>
          {CATEGORY_FILTER_OPTIONS.map((opt) => {
            const isActive = selectedFilterKey === opt.filterKey;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.categoryModalOption,
                  isActive && styles.categoryModalOptionActive,
                ]}
                onPress={() => {
                  onSelect(opt.filterKey);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.categoryModalOptionLabel,
                    isActive && styles.categoryModalOptionLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={20} color="#EA580C" />
                )}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.categoryModalCloseBtn} onPress={onClose}>
            <Text style={styles.categoryModalCloseText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
