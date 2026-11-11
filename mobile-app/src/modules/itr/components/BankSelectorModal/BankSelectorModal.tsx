import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ItrSelectableBank } from "../../itr-filing/types/itrFiling.types";
import { validators } from "@/shared/validation/validators";
import { styles } from "./BankSelectorModal.styles";
import { sanitizeBankName, isValidBankName } from "./bankValidation";
import {
  sanitizeNameInput,
  sanitizeNameOnBlur,
  isValidName,
} from "@/shared/validators/nameValidator";

export {
  sanitizeBankName,
  isValidBankName,
  sanitizeNameInput,
  sanitizeNameOnBlur,
  isValidName,
};

interface BankSelectorModalProps {
  visible: boolean;
  banks: ItrSelectableBank[];
  selectedBankId?: string;
  initialBank?: ItrSelectableBank | null;
  onSelectBank: (bankId: string) => void;
  onAddBank: (bank: ItrSelectableBank) => void;
  onUpdateBank?: (bank: ItrSelectableBank) => void;
  onClose: () => void;
}

interface BankFormContentProps {
  banks: ItrSelectableBank[];
  initialBank?: ItrSelectableBank | null;
  onSelectBank: (bankId: string) => void;
  onAddBank: (bank: ItrSelectableBank) => void;
  onUpdateBank?: (bank: ItrSelectableBank) => void;
  onClose: () => void;
}

const BankFormContent: React.FC<BankFormContentProps> = ({
  banks,
  initialBank,
  onSelectBank,
  onAddBank,
  onUpdateBank,
  onClose,
}) => {
  const [bankName, setBankName] = useState(
    initialBank?.bankName ? sanitizeBankName(initialBank.bankName) : ""
  );
  const [branchName, setBranchName] = useState(
    initialBank?.branchName ? sanitizeNameInput(initialBank.branchName) : ""
  );
  const [accountNumber, setAccountNumber] = useState(initialBank?.accountNumber || "");
  const [ifscCode, setIfscCode] = useState(initialBank?.ifscCode || "");
  const [ifscError, setIfscError] = useState<string | null>(null);

  // Preserve internal contract without displaying Account Type UI
  const accountType: "Savings" | "Current" = initialBank?.accountType || "Savings";

  const isEditing = Boolean(initialBank);

  const handleBankNameChange = (val: string) => {
    setBankName(sanitizeBankName(val));
  };

  const handleBranchNameChange = (val: string) => {
    setBranchName(sanitizeNameInput(val));
  };

  const handleIfscChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setIfscCode(clean);
    if (ifscError && validators.ifsc("IFSC Code")(clean) === null) {
      setIfscError(null);
    }
  };

  const handleSaveBank = () => {
    const cleanBankName = sanitizeNameOnBlur(bankName);
    const cleanBranchName = sanitizeNameOnBlur(branchName);
    const cleanAccountNum = accountNumber.trim();
    const cleanIfsc = ifscCode.trim().toUpperCase();

    if (!cleanBankName || !cleanAccountNum || !cleanIfsc) {
      Alert.alert(
        "Required Fields",
        "Bank Name, Account Number, and IFSC Code are mandatory. Please fill in all fields."
      );
      return;
    }

    if (!isValidBankName(cleanBankName)) {
      Alert.alert(
        "Invalid Bank Name",
        "Please enter a valid bank name (at least 2 characters long)."
      );
      return;
    }

    if (cleanBranchName && !isValidName(cleanBranchName, 2, 60)) {
      Alert.alert(
        "Invalid Branch Name",
        "Please enter a valid branch name (English letters and single spaces only, at least 2 characters long)."
      );
      return;
    }

    const accountError = validators.bankAccountNumber("Account Number")(cleanAccountNum);
    if (accountError) {
      Alert.alert("Invalid Account Number", accountError);
      return;
    }

    const validationIfscError = validators.ifsc("IFSC Code")(cleanIfsc);
    if (validationIfscError) {
      setIfscError(validationIfscError);
      Alert.alert(
        "Invalid IFSC Code",
        "Please enter a valid 11-digit IFSC code (e.g. SBIN0001234 or HDFC0001234)."
      );
      return;
    }

    const isDuplicate = banks.some(
      (b) =>
        b.id !== initialBank?.id &&
        b.accountNumber.trim() === cleanAccountNum &&
        b.ifscCode.trim().toUpperCase() === cleanIfsc
    );

    if (isDuplicate) {
      Alert.alert(
        "Duplicate Bank Account",
        "This bank account has already been added. Duplicate bank accounts are not permitted."
      );
      return;
    }

    const masked = `•••• •••• ${cleanAccountNum.slice(-4)}`;

    if (initialBank) {
      const updatedBank: ItrSelectableBank = {
        ...initialBank,
        bankName: cleanBankName,
        branchName: cleanBranchName || undefined,
        accountNumber: cleanAccountNum,
        maskedAccountNumber: masked,
        ifscCode: cleanIfsc,
        accountType,
        validationStatus: "Validated",
      };
      if (onUpdateBank) {
        onUpdateBank(updatedBank);
      } else {
        onAddBank(updatedBank);
      }
      onSelectBank(updatedBank.id);
    } else {
      const newBank: ItrSelectableBank = {
        id: `bank-${Date.now()}`,
        bankName: cleanBankName,
        branchName: cleanBranchName || undefined,
        accountNumber: cleanAccountNum,
        maskedAccountNumber: masked,
        ifscCode: cleanIfsc,
        accountType,
        isPrimaryRefund: true,
        validationStatus: "Validated",
      };
      onAddBank(newBank);
      onSelectBank(newBank.id);
    }

    onClose();
  };

  return (
    <View style={styles.modalContent}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name={isEditing ? "create-outline" : "card-outline"} size={20} color="#083B75" />
          <Text style={styles.headerTitle}>{isEditing ? "Edit Bank Account" : "Add Bank Account"}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {isEditing
          ? "Update your bank account details for receiving direct tax refunds."
          : "Enter bank details for receiving your direct income tax refund from CPC Bengaluru."}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
        {/* Bank Name — Manually entered */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Bank Name</Text>
            <Text style={styles.mandatoryStar}>*</Text>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. State Bank of India or HDFC Bank"
              placeholderTextColor="#94A3B8"
              value={bankName}
              onChangeText={handleBankNameChange}
              onBlur={() => setBankName(sanitizeNameOnBlur(bankName))}
              maxLength={60}
            />
          </View>
        </View>

        {/* Branch Name — Manually entered */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Branch Name (Optional)</Text>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Indiranagar Branch"
              placeholderTextColor="#94A3B8"
              value={branchName}
              onChangeText={handleBranchNameChange}
              onBlur={() => setBranchName(sanitizeNameOnBlur(branchName))}
              maxLength={60}
            />
          </View>
        </View>

        {/* IFSC Code — Manually entered with local format validation */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>IFSC Code</Text>
            <Text style={styles.mandatoryStar}>*</Text>
          </View>
          <View style={[styles.inputBox, ifscError ? styles.inputBoxError : null]}>
            <TextInput
              style={[styles.textInput, styles.ifscTextInput]}
              autoCapitalize="characters"
              placeholder="e.g. SBIN0001234"
              placeholderTextColor="#94A3B8"
              value={ifscCode}
              onChangeText={handleIfscChange}
              maxLength={11}
            />
          </View>
          {ifscError ? (
            <Text style={styles.errorText}>{ifscError}</Text>
          ) : null}
        </View>

        {/* Account Number */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Account Number</Text>
            <Text style={styles.mandatoryStar}>*</Text>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              placeholder="Enter 9 to 18 digit account number"
              placeholderTextColor="#94A3B8"
              value={accountNumber}
              onChangeText={(val) => setAccountNumber(val.replace(/[^0-9]/g, ""))}
              maxLength={18}
            />
          </View>
        </View>

        {/* Save & Validate Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.saveBankBtn}
          onPress={handleSaveBank}
        >
          <Text style={styles.saveBankBtnText}>
            {isEditing ? "Update Bank Account" : "Save & Validate Account"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export const BankSelectorModal: React.FC<BankSelectorModalProps> = ({
  visible,
  banks,
  initialBank,
  onSelectBank,
  onAddBank,
  onUpdateBank,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {visible && (
          <BankFormContent
            key={initialBank?.id || "new-bank"}
            banks={banks}
            initialBank={initialBank}
            onSelectBank={onSelectBank}
            onAddBank={onAddBank}
            onUpdateBank={onUpdateBank}
            onClose={onClose}
          />
        )}
      </View>
    </Modal>
  );
};

export default BankSelectorModal;
