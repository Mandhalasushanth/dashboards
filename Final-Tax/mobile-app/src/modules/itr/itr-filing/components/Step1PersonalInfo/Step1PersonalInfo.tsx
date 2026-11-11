import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { ItrSelectableBank } from "../../types/itrFiling.types";
import { getSupportedAssessmentYears } from "../../../taxRules";
import { BankSelectorModal, isValidBankName } from "../../../components/BankSelectorModal";
import { styles } from "./Step1PersonalInfo.styles";
import { Step1PriorItrImport } from "./components/Step1PriorItrImport";
import { Step1TaxpayerIdentityCard } from "./components/Step1TaxpayerIdentityCard";
import { validators } from "@/shared/validation/validators";
import { isValidName } from "@/shared/validators/nameValidator";
import { RESIDENTIAL_STATUS_OPTIONS, FILING_TYPES } from "./Step1PersonalInfo.constants";
import { Step1PersonalInfoProps } from "./Step1PersonalInfo.types";

export const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  isLoading = false,
  isEditing,
  personalInfo,
  onUpdatePersonalInfo,
  bankDetails,
  bankAccountsList,
  onSelectRefundBank,
  onAddBankAccount,
  onUpdateBankAccount,
  priorItrNotice,
  onUpdatePriorItrNotice,
  onImportPriorItrData,
  onContinue,
  onUpdateAndContinue,
  onSectionLayout,
}) => {
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<ItrSelectableBank | null>(null);
  const [isPreviousItrExpanded, setIsPreviousItrExpanded] = useState(false);
  const [showCustomAy, setShowCustomAy] = useState(false);
  const [isCustomYearInputMode, setIsCustomYearInputMode] = useState(false);
  const [customYearText, setCustomYearText] = useState("");

  const supportedAYs = getSupportedAssessmentYears();

  const handleValidateAndContinue = () => {
    if (!personalInfo.name || !personalInfo.name.trim()) {
      Alert.alert(
        "Full Legal Name Required",
        "Please provide your full legal name in your profile to proceed with ITR Filing."
      );
      return;
    }

    if (!isValidName(personalInfo.name.trim(), 2, 100)) {
      Alert.alert(
        "Invalid Full Legal Name",
        "Full Legal Name in your profile contains invalid characters or punctuation. Please ensure it contains English letters and single spaces only."
      );
      return;
    }

    if (!personalInfo.assessmentYear) {
      Alert.alert(
        "Assessment Year Required",
        "Please select the assessment year for which you are filing this income tax return."
      );
      return;
    }

    if (!personalInfo.residentialStatus) {
      Alert.alert(
        "Residential Status Required",
        "Please select your residential status (Resident, NRI, or RNOR)."
      );
      return;
    }

    if (!personalInfo.filingType) {
      Alert.alert(
        "Filing Type Required",
        "Please select your applicable filing type."
      );
      return;
    }

    if (!bankDetails.bankName.trim() || !bankDetails.accountNumber.trim()) {
      Alert.alert(
        "Missing Refund Bank Account",
        "Please select or add a bank account to receive direct income tax refund credit."
      );
      return;
    }

    if (!isValidBankName(bankDetails.bankName.trim())) {
      Alert.alert(
        "Invalid Bank Name",
        "Please select or add a valid bank name (English letters and single spaces only, at least 2 characters long)."
      );
      return;
    }

    if (bankDetails.branchName && !isValidName(bankDetails.branchName.trim(), 2, 60)) {
      Alert.alert(
        "Invalid Branch Name",
        "The selected branch name contains invalid characters. Please ensure it contains English letters and single spaces only."
      );
      return;
    }

    const accountError = validators.bankAccountNumber("Bank account number")(bankDetails.accountNumber);
    if (accountError) {
      Alert.alert("Invalid Account Number", accountError);
      return;
    }

    const ifscError = validators.ifsc("IFSC code")(bankDetails.ifscCode);
    if (ifscError) {
      Alert.alert("Invalid IFSC Code", ifscError);
      return;
    }

    onContinue();
  };

  return (
    <View style={styles.container}>
      {/* 1. Taxpayer Identity Confirmation Card (From Profile) */}
      <Step1TaxpayerIdentityCard personalInfo={personalInfo} />

      {/* 2. Assessment Year & Rule Version Selection */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="calendar-outline" size={18} color="#083B75" />
            <Text style={styles.cardTitle}>Assessment Year (AY)</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Select the assessment year for which you are filing this income tax return.
        </Text>

        <View style={styles.pickerRow}>
          {(() => {
            const localAYs = [...supportedAYs];
            if (personalInfo.assessmentYear && !localAYs.find(a => a.id === personalInfo.assessmentYear)) {
              const parts = personalInfo.assessmentYear.split("-");
              const yr = parseInt(parts[0], 10);
              if (!isNaN(yr)) {
                localAYs.push({
                  id: personalInfo.assessmentYear,
                  label: `AY ${personalInfo.assessmentYear}`,
                  sub: `FY ${yr - 1}-${String(yr).slice(-2)} (Custom)`,
                  financialYear: `${yr - 1}-${yr}`,
                  isCurrent: false
                });
              }
            }
            return localAYs
              .sort((a, b) => a.id.localeCompare(b.id))
              .filter((ay) => !ay.sub.includes("Advance") || showCustomAy)
              .map((ay) => {
                const isSelected = personalInfo.assessmentYear === ay.id;
                return (
                  <TouchableOpacity
                    key={ay.id}
                    activeOpacity={0.8}
                    style={[styles.pickerPill, isSelected && styles.pickerPillSelected, { position: 'relative' }]}
                    onPress={() => onUpdatePersonalInfo({ assessmentYear: ay.id })}
                  >
                    <Text
                      style={[
                        styles.pickerPillText,
                        isSelected && styles.pickerPillTextSelected,
                      ]}
                    >
                      {ay.label}
                    </Text>
                    <Text
                      style={[
                        styles.pickerPillSubText,
                        isSelected && styles.pickerPillSubTextSelected,
                      ]}
                    >
                      FY {ay.financialYear}
                    </Text>

                    {ay.sub.includes("Custom") && (
                      <TouchableOpacity
                        style={styles.customAyDeleteBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          onUpdatePersonalInfo({ assessmentYear: supportedAYs[0].id });
                        }}
                      >
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              });
          })()}
        </View>

      </View>

      {/* 3. Residential Status Confirmation */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="globe-outline" size={18} color="#083B75" />
            <Text style={styles.cardTitle}>Residential Status</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Select your residential status in India for the selected financial year.
        </Text>

        <View style={styles.pickerRow}>
          {RESIDENTIAL_STATUS_OPTIONS.map((res) => {
            const isSelected = personalInfo.residentialStatus === res.id;
            return (
              <TouchableOpacity
                key={res.id}
                activeOpacity={0.8}
                style={[styles.pickerPill, isSelected && styles.pickerPillSelected]}
                onPress={() =>
                  onUpdatePersonalInfo({
                    residentialStatus: res.id,
                    residentialStatusConfirmed: true,
                  })
                }
              >
                {/* BUG_B26_003: "Non-Resident (NRI)" exceeds single-line pill width on narrow
                    screens — allow up to 2 lines so the label wraps instead of clipping */}
                <Text
                  style={[
                    styles.pickerPillText,
                    isSelected && styles.pickerPillTextSelected,
                  ]}
                  numberOfLines={2}
                >
                  {res.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {Boolean(personalInfo.residentialStatus) && (
          <View style={styles.residencyInfoBox}>
            <Text style={styles.residencyInfoText}>
              Selected Status:{" "}
              <Text style={styles.residencyInfoHighlight}>
                {RESIDENTIAL_STATUS_OPTIONS.find((r) => r.id === personalInfo.residentialStatus)?.label || personalInfo.residentialStatus}
              </Text>
              {personalInfo.residentialStatus === "Resident"
                ? " — Applicable to individuals residing primarily in India during the financial year."
                : " — Special provisions for foreign income and DTAA apply."}
            </Text>
          </View>
        )}
      </View>

      {/* 4. Filing Type Selection */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="receipt-outline" size={18} color="#083B75" />
            <Text style={styles.cardTitle}>Filing Type</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Select your return filing type according to the Income Tax Act, 1961.
        </Text>

        <View style={styles.radioList}>
          {FILING_TYPES.map((type) => {
            const isSelected = personalInfo.filingType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                activeOpacity={0.8}
                style={[styles.radioCard, isSelected && styles.radioCardSelected]}
                onPress={() => onUpdatePersonalInfo({ filingType: type.id })}
              >
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={isSelected ? BrandColors.PRIMARY_ORANGE : "#64748B"}
                />
                <View style={styles.radioCardTextCol}>
                  <Text style={styles.radioCardTitle}>
                    {type.title} ({type.section})
                  </Text>
                  <Text style={styles.radioCardSubtitle}>{type.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 5. Refund Bank Account */}
      <View
        style={styles.card}
        onLayout={(e) => onSectionLayout?.("bank", e.nativeEvent.layout.y)}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="card-outline" size={18} color="#083B75" />
            <Text style={styles.cardTitle}>Refund Bank Account</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Select the bank account to receive direct tax refund credit from the Income Tax Department.
        </Text>

        {bankAccountsList.length === 0 ? (
          <View style={styles.emptyBankCard}>
            <Text style={styles.emptyBankText}>
              No bank accounts added yet. Please add a bank account for refund credit.
            </Text>
          </View>
        ) : (
          <View style={styles.bankList}>
            {bankAccountsList.map((bank) => {
              const isSelected =
                bankDetails.accountNumber === bank.accountNumber &&
                Boolean(bankDetails.accountNumber);
              return (
                <TouchableOpacity
                  key={bank.id}
                  activeOpacity={0.8}
                  style={[
                    styles.bankSelectableCard,
                    isSelected && styles.bankSelectableCardSelected,
                  ]}
                  onPress={() => onSelectRefundBank(bank.id)}
                >
                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={isSelected ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
                    style={styles.bankRadioLeft}
                  />
                  <View style={styles.bankInfoCol}>
                    <View style={styles.bankTitleRow}>
                      <Text style={styles.bankNameText}>{bank.bankName}</Text>
                      {bank.validationStatus === "Validated" && (
                        <View style={styles.verifiedTag}>
                          <Ionicons name="shield-checkmark" size={11} color="#166534" />
                          <Text style={styles.verifiedTagText}>Validated</Text>
                        </View>
                      )}
                      {isSelected && (
                        <View style={styles.verifiedTag}>
                          <Ionicons name="checkmark-circle" size={11} color="#166534" />
                          <Text style={styles.verifiedTagText}>Selected</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.bankMaskedNumber}>
                      {bank.maskedAccountNumber || `•••• •••• ${bank.accountNumber.slice(-4)}`}
                    </Text>
                    <Text style={styles.bankSubText}>
                      IFSC: {bank.ifscCode}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.bankEditBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      setEditingBank(bank);
                      setShowBankModal(true);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={15} color="#083B75" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.changeBankBtn}
          onPress={() => {
            setEditingBank(null);
            setShowBankModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={16} color="#083B75" />
          <Text style={styles.changeBankBtnText}>
            {bankAccountsList.length === 0 ? "Add Bank Account" : "Add Another Bank Account"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 6. Previous ITR Import (Optional & Collapsible) */}
      <Step1PriorItrImport
        priorItrNotice={priorItrNotice}
        isPreviousItrExpanded={isPreviousItrExpanded}
        setIsPreviousItrExpanded={setIsPreviousItrExpanded}
        onUpdatePriorItrNotice={onUpdatePriorItrNotice}
        onImportPriorItrData={onImportPriorItrData}
      />

      {/* 2 Distinct Buttons for Update (PUT) and Create (POST) */}
      {isEditing ? (
        /* Separate Button 1: Update & Continue (PUT Method) */
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.continueButton}
          onPress={onUpdateAndContinue || handleValidateAndContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Update & Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      ) : (
        /* Separate Button 2: Continue (POST Method) */
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.continueButton}
          onPress={handleValidateAndContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Confirm & Continue to Income</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Select Refund Bank Account Modal */}
      <BankSelectorModal
        visible={showBankModal}
        banks={bankAccountsList}
        initialBank={editingBank}
        selectedBankId={bankAccountsList.find((b) => b.isPrimaryRefund)?.id}
        onSelectBank={(id) => onSelectRefundBank(id)}
        onAddBank={(newBank) => onAddBankAccount(newBank)}
        onUpdateBank={(updated) => onUpdateBankAccount?.(updated)}
        onClose={() => {
          setShowBankModal(false);
          setEditingBank(null);
        }}
      />
    </View>
  );
};
