import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AmountTextInput } from "@/shared/components/AmountTextInput";
import { AdditionalDeductionItem } from "../../types/itrFiling.types";
import { styles } from "./Step3RegimeAndDeductions.styles";

interface AddDeductionModalProps {
  visible: boolean;
  onClose: () => void;
  /** Receives the new deduction; the step appends it to its list. */
  onAdd: (item: AdditionalDeductionItem) => void;
}

/** Form for adding an "other" deduction (80G, 80CCD, 80TTA, 80DD) in Step 3. */
export const AddDeductionModal: React.FC<AddDeductionModalProps> = ({ visible, onClose, onAdd }) => {
  const [newDeductionType] = useState<"80G" | "80TTA" | "80CCD_NPS" | "80DD">("80G");
  const [newDeductionTitle, setNewDeductionTitle] = useState("");
  const [newDeductionAmount, setNewDeductionAmount] = useState("");

  const handleAddDeduction = () => {
    if (!newDeductionAmount.trim()) {
      Alert.alert("Amount Required", "Please enter the deduction amount.");
      return;
    }

    const defaultTitle =
      newDeductionType === "80G"
        ? "80G Charitable Donations"
        : newDeductionType === "80TTA"
          ? "80TTA Savings Account Interest"
          : newDeductionType === "80CCD_NPS"
            ? "80CCD(1B) NPS Additional Contribution"
            : "80DD Medical for Disabled Dependent";

    const newItem: AdditionalDeductionItem = {
      id: `ded-${Date.now()}`,
      type: newDeductionType,
      title: newDeductionTitle.trim() || defaultTitle,
      amount: newDeductionAmount.replace(/[^0-9]/g, ""),
    };

    onAdd(newItem);

    setNewDeductionTitle("");
    setNewDeductionAmount("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Add Additional Deduction</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Deduction Section</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 80G Charitable Donations"
                placeholderTextColor="#94A3B8"
                value={newDeductionTitle}
                onChangeText={setNewDeductionTitle}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount Claimed</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                value={newDeductionAmount}
                onChangeText={setNewDeductionAmount}
              />
            </View>
          </View>

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionBtnCancel}
              onPress={onClose}
            >
              <Text style={styles.actionBtnCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.actionBtnSave}
              onPress={handleAddDeduction}
            >
              <Text style={styles.actionBtnSaveText}>Add Deduction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddDeductionModal;
