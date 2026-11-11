import React from "react";
import { View, Text, TextInput } from "react-native";
import { BankRefundDetails } from "../../types/customerIncome.types";
import { cleanAccountNumber } from "../../utils/tdsValidation";
import { CustomerFormErrors } from "../../validation/tdsCustomerSchema";
import { styles } from "./TdsRefundFormScreen.styles";
import { TdsFormInputRefs, UpdateBankField, SectionHeader } from "./TdsRefundFormSections.types";
import { sanitizeNameInput, sanitizeNameOnBlur } from "@/shared/validators/nameValidator";

interface RefundBankAccountSectionProps {
  bank: BankRefundDetails;
  errors: CustomerFormErrors;
  inputs: TdsFormInputRefs;
  updateBank: UpdateBankField;
  onIfscChange: (val: string) => void;
  onBlurField?: (key: string) => void;
}

export const RefundBankAccountSection: React.FC<RefundBankAccountSectionProps> = ({
  bank,
  errors,
  inputs: { accHolderRef, accNumRef, confirmAccNumRef, ifscRef },
  updateBank,
  onIfscChange,
  onBlurField,
}) => (
  <View style={styles.sectionCard}>
    <SectionHeader number={2} title="Refund Bank Account" />

    {/* Account Holder Name */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Account Holder Name <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={accHolderRef}
        style={[styles.textInput, errors["bank.accountHolderName"] ? styles.textInputError : null]}
        placeholder="Enter account holder name"
        placeholderTextColor="#94A3B8"
        value={bank.accountHolderName}
        onChangeText={(t) => updateBank("accountHolderName", sanitizeNameInput(t))}
        onBlur={() => {
          if (bank.accountHolderName) {
            updateBank("accountHolderName", sanitizeNameOnBlur(bank.accountHolderName));
          }
          onBlurField?.("bank.accountHolderName");
        }}
        maxLength={50}
        returnKeyType="next"
        onSubmitEditing={() => accNumRef.current?.focus()}
      />
      {errors["bank.accountHolderName"] && (
        <Text style={styles.errorText}>{errors["bank.accountHolderName"]}</Text>
      )}
    </View>

    {/* Bank Account Number (Full Width for clean fit) */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Bank Account Number <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={accNumRef}
        style={[styles.textInput, errors["bank.accountNumber"] ? styles.textInputError : null]}
        placeholder="Enter account number"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        value={bank.accountNumber}
        onChangeText={(t) => updateBank("accountNumber", cleanAccountNumber(t))}
        onBlur={() => onBlurField?.("bank.accountNumber")}
        maxLength={18}
        returnKeyType="next"
        onSubmitEditing={() => confirmAccNumRef.current?.focus()}
      />
      {errors["bank.accountNumber"] && (
        <Text style={styles.errorText}>{errors["bank.accountNumber"]}</Text>
      )}
    </View>

    {/* Confirm Account Number (Full Width for clean fit) */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Confirm Account Number <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={confirmAccNumRef}
        style={[styles.textInput, errors["bank.confirmAccountNumber"] ? styles.textInputError : null]}
        placeholder="Re-enter account number"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        value={bank.confirmAccountNumber}
        onChangeText={(t) => updateBank("confirmAccountNumber", cleanAccountNumber(t))}
        onBlur={() => onBlurField?.("bank.confirmAccountNumber")}
        maxLength={18}
        returnKeyType="next"
        onSubmitEditing={() => ifscRef.current?.focus()}
      />
      {errors["bank.confirmAccountNumber"] && (
        <Text style={styles.errorText}>{errors["bank.confirmAccountNumber"]}</Text>
      )}
    </View>

    {/* IFSC Code */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        IFSC Code <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={ifscRef}
        style={[styles.textInput, errors["bank.ifscCode"] ? styles.textInputError : null]}
        placeholder="Enter IFSC (e.g. HDFC0001234)"
        placeholderTextColor="#94A3B8"
        autoCapitalize="characters"
        value={bank.ifscCode}
        onChangeText={onIfscChange}
        onBlur={() => onBlurField?.("bank.ifscCode")}
        maxLength={11}
        returnKeyType="done"
      />
      {errors["bank.ifscCode"] && (
        <Text style={styles.errorText}>{errors["bank.ifscCode"]}</Text>
      )}
    </View>

    {/* Bank Name & Branch (Manual Entry) */}
    <View style={styles.fieldRow}>
      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>
          Bank Name <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <TextInput
          style={[styles.textInput, errors["bank.bankName"] ? styles.textInputError : null]}
          editable={true}
          placeholder="Enter Bank Name"
          placeholderTextColor="#94A3B8"
          value={bank.bankName}
          onChangeText={(val) => updateBank("bankName", sanitizeNameInput(val))}
          onBlur={() => {
            if (bank.bankName) {
              updateBank("bankName", sanitizeNameOnBlur(bank.bankName));
            }
            onBlurField?.("bank.bankName");
          }}
          maxLength={60}
        />
        {errors["bank.bankName"] && (
          <Text style={styles.errorText}>{errors["bank.bankName"]}</Text>
        )}
      </View>

      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>Branch</Text>
        <TextInput
          style={styles.textInput}
          editable={true}
          placeholder="Enter Branch"
          placeholderTextColor="#94A3B8"
          value={bank.branchName}
          onChangeText={(val) => updateBank("branchName", sanitizeNameInput(val))}
          onBlur={() => {
            if (bank.branchName) {
              updateBank("branchName", sanitizeNameOnBlur(bank.branchName));
            }
          }}
          maxLength={60}
        />
      </View>
    </View>

  </View>
);

