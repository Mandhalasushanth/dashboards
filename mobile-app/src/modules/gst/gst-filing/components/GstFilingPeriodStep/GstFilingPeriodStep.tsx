import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { gstApi } from "@/modules/gst/services/gstApi";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { getCurrentFinancialYear } from "@/modules/gst/utils/gstDateUtils";
import { dismissKeyboardThen } from "@/shared/components/KeyboardAwareFormLayout";
import { styles } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.styles";
import { GstFilingSelectModal } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingSelectModal";
import { GstCalculationMethodSection } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstCalculationMethodSection";
import { RecursivePills } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/RecursivePills";
import {
  validateGstin,
  validateEstimatedAmount,
} from "@/modules/gst/gst-filing/utils/gstFilingValidation";
import { validateGstinLive } from "@/modules/gst/utils/gstValidation";
import { GstinInfoIcon } from "@/modules/gst/components/common";
import {
  FILING_PERIODS,
  FILING_NATURE_OPTIONS,
  FINANCIAL_YEARS,
  getFilingPeriodsForFrequency,
  getReturnTypesForFrequency,
} from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/gstPeriodUtils";

export {
  FILING_PERIODS,
  FILING_NATURE_OPTIONS,
  FINANCIAL_YEARS,
  getFilingPeriodsForFrequency,
  getReturnTypesForFrequency,
};

export interface GstFilingPeriodData {
  periodType: string;
  financialYear?: string;
  filingPeriod?: string;
  filingMonth: string;
  gstin: string;
  filingType: string;
  filingNature?: "Regular Return" | "Nil Return";
  businessName?: string;
  tradeName?: string;
  legalName?: string;
  taxpayerScheme?: string;
  state?: string;
  isVerifiedEntity?: boolean;
  calculationMethod?: "ca_assisted" | "manual_estimates";
  taxableSales?: string;
  turnover?: string;
  exemptSales?: string;
  taxablePurchases?: string;
  eligibleItc?: string;
  customerId?: string;
  filingId?: string;
}

interface GstFilingPeriodStepProps {
  data: GstFilingPeriodData;
  onChange: (fields: Partial<GstFilingPeriodData>) => void;
  onBlurField?: (field: keyof GstFilingPeriodData) => void;
  onError?: (field: string, error: string) => void;
  errors?: Record<string, string>;
}

export const GstFilingPeriodStep: React.FC<GstFilingPeriodStepProps> = ({
  data,
  onChange,
  onBlurField,
  onError,
  errors = {},
}) => {
  const [showYearModal, setShowYearModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const gstinLookupRequestId = useRef(0);
  const lastQueriedGstinRef = useRef<string>("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const rawGstin = data.gstin ? data.gstin.trim().toUpperCase() : "";

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!rawGstin || validateGstin(rawGstin, false) !== null) {
      return;
    }

    if (data.isVerifiedEntity && lastQueriedGstinRef.current === rawGstin) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (lastQueriedGstinRef.current === rawGstin && data.isVerifiedEntity) {
        return;
      }

      lastQueriedGstinRef.current = rawGstin;
      const requestId = ++gstinLookupRequestId.current;
      setIsLookingUp(true);

      try {
        const entity = await gstApi.lookupGstin(rawGstin);
        if (
          requestId === gstinLookupRequestId.current &&
          entity &&
          entity.gstin === rawGstin
        ) {
          onChange({
            businessName: entity.legalName,
            tradeName: entity.tradeName,
            taxpayerScheme: entity.taxpayerScheme,
            state: entity.state,
            isVerifiedEntity: true,
          });
        }
      } catch {
        // Safe failover on lookup failure
      } finally {
        if (requestId === gstinLookupRequestId.current) {
          setIsLookingUp(false);
        }
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data.gstin, data.isVerifiedEntity, onChange]);

  const handleGstinChange = (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15);
    if (cleaned === data.gstin) {
      return;
    }

    if (isLookingUp) {
      setIsLookingUp(false);
    }

    onChange({
      gstin: cleaned,
      isVerifiedEntity: false,
      businessName: undefined,
      tradeName: undefined,
      legalName: undefined,
      taxpayerScheme: undefined,
      state: undefined,
    });

    // Progressive live validation — error appears at the relevant character position
    onError?.("gstin", validateGstinLive(cleaned) ?? "");
  };

  const currentPeriods = useMemo(
    () =>
      getFilingPeriodsForFrequency(
        data.periodType,
        data.financialYear || getCurrentFinancialYear("FY ")
      ),
    [data.periodType, data.financialYear]
  );

  const currentReturnTypes = useMemo(
    () => getReturnTypesForFrequency(data.periodType),
    [data.periodType]
  );

  const getPeriodModalTitle = () => {
    if (data.periodType === "Quarterly") return "Select Filing Quarter";
    if (data.periodType === "Monthly") return "Select Filing Month";
    if (data.periodType === "Annual") return "Select Filing Year";
    return "Select Filing Period";
  };

  const selectedPeriodValue = data.filingPeriod || data.filingMonth;

  return (
    <View style={styles.container}>
      {/* CARD 1: Filing Frequency & Period */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <Ionicons name="calendar-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionMainTitle}>Filing Frequency & Period</Text>
            <Text style={styles.sectionSubtitle}>Select filing frequency and return period</Text>
          </View>
        </View>

        {/* 1. Select Filing Frequency (Pills) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Select Filing Frequency *</Text>
          <View style={styles.periodPillsRow}>
            <RecursivePills
              items={FILING_PERIODS}
              selectedValue={data.periodType}
              onSelect={(period) => {
                onChange({
                  periodType: period,
                  filingPeriod: "",
                  filingMonth: "",
                  filingType: "",
                });
                onError?.("periodType", "");
                onError?.("filingPeriod", "");
                onBlurField?.("periodType");
              }}
            />
          </View>
          <Text style={styles.frequencyHint}>
            Frequency filters both the period list and the return types below.
          </Text>
          {errors.periodType ? (
            <Text style={styles.errorText}>{errors.periodType}</Text>
          ) : null}
        </View>

        {/* 2. Financial Year Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Financial Year *</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => dismissKeyboardThen(() => setShowYearModal(true))}
            style={[styles.selectInput, errors.financialYear && styles.inputError]}
          >
            <Text
              style={[styles.selectText, !data.financialYear && styles.placeholderText]}
            >
              {data.financialYear || "Select financial year"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.frequencyHint}>
            Historical periods are available based on GST portal eligibility and filing rules.
          </Text>
          {errors.financialYear ? (
            <Text style={styles.errorText}>{errors.financialYear}</Text>
          ) : null}
        </View>

        {/* 3. Filing Period / Return Period Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Filing Period / Return Period *</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (!data.periodType) {
                onError?.("filingPeriod", "Select filing frequency first");
                return;
              }
              dismissKeyboardThen(() => setShowPeriodModal(true));
            }}
            style={[
              styles.selectInput,
              (errors.filingPeriod || errors.filingMonth) && styles.inputError,
              !data.periodType && { opacity: 0.75 },
            ]}
          >
            <Text
              style={[styles.selectText, !selectedPeriodValue && styles.placeholderText]}
            >
              {selectedPeriodValue || (!data.periodType ? "Select filing frequency first" : "Select return period")}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {errors.filingPeriod || errors.filingMonth ? (
            <Text style={styles.errorText}>
              {errors.filingPeriod || errors.filingMonth}
            </Text>
          ) : null}
        </View>
      </View>

      {/* CARD 2: Taxpayer & Return Details */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <Ionicons name="document-text-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionMainTitle}>Taxpayer & Return Details</Text>
            <Text style={styles.sectionSubtitle}>Enter 15-character GSTIN & return type</Text>
          </View>
        </View>

        {/* 4. GSTIN (15-Character) */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { marginBottom: 0 }]}>
              GSTIN (15-Character) <Text style={styles.star}>*</Text>
            </Text>
            <GstinInfoIcon />
          </View>
          <TextInput
            style={[styles.input, errors.gstin && styles.inputError]}
            placeholder="Enter GSTIN"
            placeholderTextColor="#94A3B8"
            value={data.gstin}
            onChangeText={handleGstinChange}
            onBlur={() => {
              if (data.gstin) {
                const err = validateGstin(data.gstin, true);
                onError?.("gstin", err || "");
              }
              onBlurField?.("gstin");
            }}
            onSubmitEditing={() => {
              if (data.gstin) {
                const err = validateGstin(data.gstin, true);
                onError?.("gstin", err || "");
              }
            }}
            returnKeyType="done"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={15}
          />
          {isLookingUp ? (
            <ActivityIndicator
              size="small"
              color={BrandColors.PRIMARY_ORANGE}
              style={styles.lookupIndicator}
            />
          ) : null}
          {errors.gstin ? (
            <Text style={styles.errorText}>{errors.gstin}</Text>
          ) : null}

          {/* Backend-Verified Entity Card (auto-resolved from GST portal) */}
          {data.isVerifiedEntity ? (
            <View style={styles.verifiedCard}>
              <View style={styles.verifiedTopRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={15} color="#059669" />
                  <Text style={styles.verifiedBadgeText}>
                    Verified from GST Portal
                  </Text>
                </View>
                <Text style={styles.verifiedStateText}>
                  {data.state || "Active"}
                </Text>
              </View>
              <Text style={styles.verifiedTradeName}>
                {data.tradeName || data.businessName}
              </Text>
              <Text style={styles.verifiedLegalName}>{data.businessName}</Text>
              <View style={styles.schemePill}>
                <Text style={styles.schemePillText}>
                  {data.taxpayerScheme || "Regular Scheme"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 5. Filing Return Type Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Filing Return Type *</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => dismissKeyboardThen(() => setShowTypeModal(true))}
            style={[styles.selectInput, errors.filingType && styles.inputError]}
          >
            <Text
              style={[styles.selectText, !data.filingType && styles.placeholderText]}
              numberOfLines={1}
            >
              {data.filingType || "Select return type"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {errors.filingType ? (
            <Text style={styles.errorText}>{errors.filingType}</Text>
          ) : null}
        </View>

        {/* 6. Filing Type (Regular vs Nil) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Filing Type *</Text>
          <View style={styles.periodPillsRow}>
            <RecursivePills
              items={FILING_NATURE_OPTIONS}
              selectedValue={data.filingNature || "Regular Return"}
              onSelect={(type) =>
                onChange({ filingNature: type as "Regular Return" | "Nil Return" })
              }
            />
          </View>
        </View>
      </View>

      {/* 7. Tax Calculation Method */}
      {data.filingNature !== "Nil Return" ? (
        <GstCalculationMethodSection
          calculationMethod={data.calculationMethod}
          taxableSales={data.taxableSales}
          taxablePurchases={data.taxablePurchases}
          eligibleItc={data.eligibleItc}
          errors={errors}
          onChange={(fields) => {
            onChange(fields);
          }}
          onBlurField={(field) => {
            const isManual = data.calculationMethod === "manual_estimates";
            if (field === "taxableSales") {
              const err = validateEstimatedAmount(data.taxableSales, "sales", isManual);
              onError?.("taxableSales", err || "");
            } else if (field === "taxablePurchases") {
              const err = validateEstimatedAmount(data.taxablePurchases, "purchases", isManual);
              onError?.("taxablePurchases", err || "");
            } else if (field === "eligibleItc") {
              const err = validateEstimatedAmount(data.eligibleItc, "eligible ITC", isManual);
              onError?.("eligibleItc", err || "");
            }
          }}
        />
      ) : null}

      {/* Dynamic Financial Year Selection Modal */}
      <GstFilingSelectModal
        visible={showYearModal}
        title="Select Financial Year"
        data={FINANCIAL_YEARS}
        selectedValue={data.financialYear}
        onSelect={(item) => {
          onChange({
            financialYear: item,
            filingPeriod: "",
            filingMonth: "",
          });
          setShowYearModal(false);
        }}
        onClose={() => setShowYearModal(false)}
      />

      {/* Period Selection Modal (Monthly / Quarterly / Annual) */}
      <GstFilingSelectModal
        visible={showPeriodModal}
        title={getPeriodModalTitle()}
        data={currentPeriods}
        selectedValue={selectedPeriodValue}
        onSelect={(item) => {
          onChange({
            filingPeriod: item,
            filingMonth: item,
          });
          setShowPeriodModal(false);
        }}
        onClose={() => setShowPeriodModal(false)}
      />

      {/* Filing Type Selection Modal */}
      <GstFilingSelectModal
        visible={showTypeModal}
        title="Select Return Type"
        data={currentReturnTypes}
        selectedValue={data.filingType}
        numberOfLines={2}
        onSelect={(item) => {
          onChange({ filingType: item });
          setShowTypeModal(false);
        }}
        onClose={() => setShowTypeModal(false)}
      />
    </View>
  );
};
