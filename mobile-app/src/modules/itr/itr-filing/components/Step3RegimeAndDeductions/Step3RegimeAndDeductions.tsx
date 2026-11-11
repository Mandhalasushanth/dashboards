import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  TaxRegimeType,
  ItrStructuredDeductions,
  TaxCalculationBreakdown,
  AdditionalDeductionItem,
} from "../../types/itrFiling.types";
import { BrandColors } from "@/shared/theme";
import { RegimeComparisonTable } from "../../../components/RegimeComparisonTable";
import { AmountTextInput } from "@/shared/components/AmountTextInput";
import { styles } from "./Step3RegimeAndDeductions.styles";

interface Step3RegimeAndDeductionsProps {
  isEditing?: boolean;
  regime: TaxRegimeType;
  onChangeRegime: (regime: TaxRegimeType) => void;
  deductions: ItrStructuredDeductions;
  onChangeDeductions: (deductions: Partial<ItrStructuredDeductions>) => void;
  calculation: TaxCalculationBreakdown;
  assessmentYear: string;
  onContinue: () => void;
}

export const Step3RegimeAndDeductions: React.FC<Step3RegimeAndDeductionsProps> = ({ isEditing, 
  regime,
  onChangeRegime,
  deductions,
  onChangeDeductions,
  calculation,
  assessmentYear,
  onContinue,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeductionType, setNewDeductionType] = useState<"80G" | "80TTA" | "80CCD_NPS" | "80DD">("80G");
  const [newDeductionTitle, setNewDeductionTitle] = useState("");
  const [newDeductionAmount, setNewDeductionAmount] = useState("");

  const hasExistingDeductions =
    Number(deductions.sec80c.epf || 0) > 0 || Number(deductions.sec80c.ppf || 0) > 0 ||
    Number(deductions.sec80c.lic || 0) > 0 || Number(deductions.sec80c.elss || 0) > 0 ||
    Number(deductions.sec80c.tuitionFees || 0) > 0 || Number(deductions.sec80c.housingPrincipal || 0) > 0 ||
    Number(deductions.sec80d.selfSpouseChildren || 0) > 0 || Number(deductions.sec80d.parents || 0) > 0 ||
    Number(deductions.sec24b || 0) > 0 || deductions.otherDeductionsList.length > 0;

  const [wantsDeductions, setWantsDeductions] = useState<boolean>(hasExistingDeductions || true);

  const update80c = (key: keyof typeof deductions.sec80c, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    onChangeDeductions({
      sec80c: {
        ...deductions.sec80c,
        [key]: cleaned,
      },
    });
  };

  const update80d = (key: keyof typeof deductions.sec80d, val: any) => {
    onChangeDeductions({
      sec80d: {
        ...deductions.sec80d,
        [key]: val,
      },
    });
  };

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

    onChangeDeductions({
      otherDeductionsList: [...deductions.otherDeductionsList, newItem],
    });

    setNewDeductionTitle("");
    setNewDeductionAmount("");
    setShowAddModal(false);
  };

  const handleRemoveDeduction = (id: string) => {
    onChangeDeductions({
      otherDeductionsList: deductions.otherDeductionsList.filter((d) => d.id !== id),
    });
  };


  const handleProceed = () => {
    if (regime === "old") {
      const hasDeductions = 
        Object.values(deductions.sec80c).some(val => Number(val) > 0) || 
        Object.values(deductions.sec80d).some(val => typeof val === "string" && Number(val) > 0) ||
        Number(deductions.sec24b) > 0 ||
        deductions.otherDeductionsList.length > 0;
      
      if (!hasDeductions) {
        Alert.alert(
          "No Deductions Entered",
          "You selected the Old Tax Regime but haven't claimed any deductions. Please enter your deductions or switch to the New Tax Regime (which is usually more beneficial if you have no deductions)."
        );
        return;
      }
    }
    onContinue();
  };

  return (
    <View style={styles.container}>
      {/* 1. Transparent Side-by-Side Regime Comparison */}
      <RegimeComparisonTable
        calculation={calculation}
        selectedRegime={regime}
        onChangeRegime={onChangeRegime}
        assessmentYear={assessmentYear}
      />

      {/* 2. Regime-Aware Deductions Filtering */}
      {regime === "new" ? (
        <View style={styles.newRegimeSuppressedCard}>
          <View style={styles.newRegimeSuppressedHeader}>
            <Ionicons name="information-circle" size={18} color="#1E40AF" />
            <Text style={styles.newRegimeSuppressedTitle}>
              Deductions Under New Tax Regime
            </Text>
          </View>
          <Text style={styles.newRegimeSuppressedText}>
            Most Chapter VI-A deductions (Section 80C, 80D, 24b) are not available under the New Tax Regime. Eligible salaried taxpayers receive the applicable standard deduction of ₹75,000 automatically.
          </Text>
        </View>
      ) : (
        /* Old Regime Structured Deductions */
        <>
          {/* Ask first if user wants to claim deductions */}
          <View style={styles.deductionDecisionCard}>
            <Text style={styles.deductionDecisionTitle}>Do you want to claim deductions?</Text>
            <Text style={styles.deductionDecisionSubtitle}>
              Under the Old Tax Regime, you can declare Section 80C, 80D, and 24(b) to reduce your taxable income.
            </Text>
            <View style={styles.pillRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.pill, wantsDeductions && styles.pillSelected]}
                onPress={() => setWantsDeductions(true)}
              >
                <Text style={[styles.pillText, wantsDeductions && styles.pillTextSelected]}>
                  Yes, Claim Deductions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.pill, !wantsDeductions && styles.pillSelected]}
                onPress={() => {
                  setWantsDeductions(false);
                  onChangeDeductions({
                    sec80c: { epf: "", ppf: "", lic: "", elss: "", tuitionFees: "", housingPrincipal: "", other80c: "" },
                    sec80d: { selfSpouseChildren: "", parents: "", isParentSeniorCitizen: false },
                    sec24b: "",
                    otherDeductionsList: [],
                  });
                }}
              >
                <Text style={[styles.pillText, !wantsDeductions && styles.pillTextSelected]}>
                  No Deductions to Claim
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {!wantsDeductions ? (
            <View style={styles.noDeductionsCard}>
              <Text style={styles.noDeductionsText}>
                No Chapter VI-A deductions will be claimed. If you do not have eligible deductions, the New Tax Regime typically offers lower tax liability.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#083B75" />
                  <Text style={styles.cardTitle}>Structured Deductions (Old Regime)</Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                Enter eligible investments and insurance expenses to claim tax deductions.
              </Text>

              {/* Section 80C */}
              <View style={styles.deductionSection}>
                <View style={styles.deductionHeaderRow}>
                  <Text style={styles.deductionSectionTitle}>Section 80C Investments</Text>
                  <View style={styles.capBadge}>
                    <Text style={styles.capBadgeText}>Capped at ₹1,50,000</Text>
                  </View>
                </View>

                <View style={styles.inputGrid}>
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>EPF (Employee Provident)</Text>
                      <View style={styles.inputBox}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <AmountTextInput
                          style={styles.textInput}
                          placeholder="e.g. 45,000"
                          placeholderTextColor="#94A3B8"
                          value={deductions.sec80c.epf}
                          onChangeText={(val) => update80c("epf", val)}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>PPF (Public Provident)</Text>
                      <View style={styles.inputBox}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <AmountTextInput
                          style={styles.textInput}
                          placeholder="e.g. 50,000"
                          placeholderTextColor="#94A3B8"
                          value={deductions.sec80c.ppf}
                          onChangeText={(val) => update80c("ppf", val)}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>Life Insurance (LIC)</Text>
                      <View style={styles.inputBox}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <AmountTextInput
                          style={styles.textInput}
                          placeholder="e.g. 25,000"
                          placeholderTextColor="#94A3B8"
                          value={deductions.sec80c.lic}
                          onChangeText={(val) => update80c("lic", val)}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>ELSS Tax-Saving Funds</Text>
                      <View style={styles.inputBox}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <AmountTextInput
                          style={styles.textInput}
                          placeholder="Mutual fund ELSS"
                          placeholderTextColor="#94A3B8"
                          value={deductions.sec80c.elss}
                          onChangeText={(val) => update80c("elss", val)}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>Children Tuition Fees</Text>
                      <View style={styles.inputBox}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <AmountTextInput
                          style={styles.textInput}
                          placeholder="School fees"
                          placeholderTextColor="#94A3B8"
                          value={deductions.sec80c.tuitionFees}
                          onChangeText={(val) => update80c("tuitionFees", val)}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>Housing Loan Principal</Text>
                      <View style={styles.inputBox}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <AmountTextInput
                          style={styles.textInput}
                          placeholder="Principal repaid"
                          placeholderTextColor="#94A3B8"
                          value={deductions.sec80c.housingPrincipal}
                          onChangeText={(val) => update80c("housingPrincipal", val)}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Section 80D */}
              <View style={styles.deductionSection}>
                <View style={styles.deductionHeaderRow}>
                  <Text style={styles.deductionSectionTitle}>Section 80D Health Insurance</Text>
                  <View style={styles.capBadge}>
                    <Text style={styles.capBadgeText}>Up to ₹25k / ₹50k</Text>
                  </View>
                </View>

                <View style={styles.inputGrid}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Self, Spouse & Dependent Children</Text>
                    <View style={styles.inputBox}>
                      <Text style={styles.currencyPrefix}>₹</Text>
                      <AmountTextInput
                        style={styles.textInput}
                        placeholder="Max 25,000"
                        placeholderTextColor="#94A3B8"
                        value={deductions.sec80d.selfSpouseChildren}
                        onChangeText={(val) => update80d("selfSpouseChildren", val)}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Parents Health Insurance</Text>
                    <View style={styles.inputBox}>
                      <Text style={styles.currencyPrefix}>₹</Text>
                      <AmountTextInput
                        style={styles.textInput}
                        placeholder="Max 25,000 (50k for senior)"
                        placeholderTextColor="#94A3B8"
                        value={deductions.sec80d.parents}
                        onChangeText={(val) => update80d("parents", val)}
                      />
                    </View>
                  </View>

                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Are your parents Senior Citizens (60+)?</Text>
                    <Switch
                      value={deductions.sec80d.isParentSeniorCitizen}
                      onValueChange={(val) => update80d("isParentSeniorCitizen", val)}
                      trackColor={{ false: "#CBD5E1", true: BrandColors.PRIMARY_ORANGE }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              </View>

              {/* Section 24b Home Loan Interest */}
              <View style={styles.deductionSection}>
                <View style={styles.deductionHeaderRow}>
                  <Text style={styles.deductionSectionTitle}>Section 24(b) Home Loan Interest</Text>
                  <View style={styles.capBadge}>
                    <Text style={styles.capBadgeText}>Max ₹2,00,000</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputBox}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <AmountTextInput
                      style={styles.textInput}
                      placeholder="Interest paid on self-occupied property"
                      placeholderTextColor="#94A3B8"
                      value={deductions.sec24b}
                      onChangeText={(val) => onChangeDeductions({ sec24b: val })}
                    />
                  </View>
                </View>
              </View>

              {/* Additional Deductions List */}
              {deductions.otherDeductionsList.map((item) => (
                <View key={item.id} style={styles.otherDeductionItem}>
                  <View style={styles.otherDeductionInfo}>
                    <Text style={styles.otherDeductionTitle}>{item.title}</Text>
                    <Text style={styles.otherDeductionAmount}>
                      ₹ {Number(item.amount).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.removeDeductionBtn}
                    onPress={() => handleRemoveDeduction(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addDeductionBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add-circle-outline" size={18} color="#083B75" />
                <Text style={styles.addDeductionBtnText}>Add Other Deduction (80G, 80CCD, 80TTA)</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Continue Button */}
      <TouchableOpacity activeOpacity={0.85} style={styles.continueButton} onPress={handleProceed}>
        <Text style={styles.continueButtonText}>{isEditing ? "Update and Continue" : "Confirm & Continue to Documents"}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Additional Deduction Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Additional Deduction</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAddModal(false)}>
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
                onPress={() => setShowAddModal(false)}
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
    </View>
  );
};
