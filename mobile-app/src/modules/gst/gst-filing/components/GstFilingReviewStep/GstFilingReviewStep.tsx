import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  formatIndianCurrency,
} from "@/shared/formatters/currencyFormatter";
import { styles } from "@/modules/gst/gst-filing/components/GstFilingReviewStep/GstFilingReviewStep.styles";

export interface GstFilingReviewStepProps {
  isFetching?: boolean;
  gstin?: string;
  businessName?: string;
  taxpayerScheme?: string;
  filingNature?: string;
  financialYear?: string;
  filingMonth?: string;
  filingType?: string;
  filingFrequency?: string;
  uploadedDocsCount?: number;
  totalRequiredDocsCount?: number;
  missingDocsCount?: number;
  grossTaxableTurnover?: number | string;
  taxablePurchases?: number | string;
  eligibleItc?: number | string;
  calculationMethod?: "ca_assisted" | "manual_estimates";
  onApprove: () => void;
  onRequestChanges?: () => void;
  onEditFilingDetails?: () => void;
  onEditTaxComputation?: () => void;
  onEditDocuments?: () => void;
  onReuploadDocuments?: () => void;
  onUpdateComputation?: (turnover: number, itc: number, purchases?: number) => void;
}

// Display only; values passed to callbacks/API stay numeric.
const formatInr = (val: number): string => formatIndianCurrency(Math.round(val));

const parseNumeric = (val: number | string | undefined, defaultVal: number): number => {
  if (typeof val === "number") return isNaN(val) ? defaultVal : val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? defaultVal : parsed;
  }
  return defaultVal;
};

export const GstFilingReviewStep: React.FC<GstFilingReviewStepProps> = ({
  gstin = "Not provided",
  businessName = "Registered Business",
  taxpayerScheme = "Regular Scheme",
  filingNature = "Regular Return",
  financialYear = "FY 2025-26",
  filingMonth = "August 2025",
  filingType = "GSTR-1",
  filingFrequency = "Monthly",
  uploadedDocsCount = 0,
  totalRequiredDocsCount = 0,
  missingDocsCount = 0,
  grossTaxableTurnover = 0,
  taxablePurchases = 0,
  eligibleItc = 0,
  calculationMethod = "ca_assisted",
  onApprove,
  onRequestChanges,
  onEditFilingDetails,
  onEditTaxComputation,
  onEditDocuments,
  isFetching,
  onReuploadDocuments,
  onUpdateComputation,
}) => {
  const isNilReturn = filingNature === "Nil Return";

  // Numeric computation state
  const baseTurnover = parseNumeric(grossTaxableTurnover, 0);
  const basePurchases = parseNumeric(taxablePurchases, 0);
  const baseItc = parseNumeric(eligibleItc, 0);

  const [currentTurnover, setCurrentTurnover] = useState(baseTurnover);
  const [currentPurchases, setCurrentPurchases] = useState(basePurchases);
  const [currentItc, setCurrentItc] = useState(baseItc);

  // Automatically update computation state when values are retrieved from database
  useEffect(() => {
    setCurrentTurnover(baseTurnover);
  }, [baseTurnover]);

  useEffect(() => {
    setCurrentPurchases(basePurchases);
  }, [basePurchases]);

  useEffect(() => {
    setCurrentItc(baseItc);
  }, [baseItc]);

  // Derived reconciled calculations
  const outputGst = Math.round(currentTurnover * 0.18);
  const netLiability = Math.max(0, outputGst - currentItc);

  const returnFormName = filingType ? filingType.split(" ")[0] : "GSTR-1";

  const renderEditButton = (onPress?: () => void) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.editBtn}
    >
      <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE} />
      <Text style={styles.editBtnText}>Edit</Text>
    </TouchableOpacity>
  );

  const hasEstimates = currentTurnover > 0 || currentPurchases > 0 || currentItc > 0;
  const isCaPending = calculationMethod === "ca_assisted" && !hasEstimates;

  return (
    <View style={styles.container}>
      {isFetching && (
        <View style={styles.syncBanner}>
          <ActivityIndicator size="small" color={BrandColors.PRIMARY_ORANGE} />
          <Text style={styles.syncBannerText}>
            Synchronizing live details from database...
          </Text>
        </View>
      )}

      {/* Ready for Review Banner */}
      <View style={styles.readyCard}>
        <View style={styles.readyIconBox}>
          <Ionicons name="checkmark-sharp" size={16} color="#059669" />
        </View>
        <View style={styles.readyTextCol}>
          <Text style={styles.readyHeading}>Ready for Review</Text>
          <Text style={styles.readySub}>
            {isNilReturn
              ? "Finsolz has prepared your Nil Return filing for submission"
              : "Finsolz CA has prepared return computation based on your verified business records"}
          </Text>
        </View>
      </View>

      {/* 1. Filing Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Filing Details</Text>
          {renderEditButton(onEditFilingDetails)}
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Filing Frequency</Text>
          <Text style={styles.value}>{filingFrequency}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Financial Year</Text>
          <Text style={styles.value}>{financialYear}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Filing Period</Text>
          <Text style={styles.value}>{filingMonth}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>GSTIN</Text>
          <Text style={styles.value}>{gstin || "Not Provided"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Business Entity</Text>
          <Text style={styles.value}>{businessName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Taxpayer Scheme</Text>
          <Text style={styles.value}>{taxpayerScheme}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Filing Return Type</Text>
          <Text style={styles.value}>{returnFormName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tax Calculation Method</Text>
          <Text style={styles.value}>
            {calculationMethod === "manual_estimates"
              ? "Self-estimated figures"
              : "Let Finsolz CA calculate from documents"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Filing Type</Text>
          <Text style={styles.value}>{filingNature}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Attached Documents</Text>
          {isNilReturn ? (
            <Text style={styles.value}>Nil Return (None Required)</Text>
          ) : missingDocsCount > 0 ? (
            <Text style={[styles.value, styles.valueMissing]}>
              {missingDocsCount} {missingDocsCount === 1 ? "Document" : "Documents"} Missing
            </Text>
          ) : (
            <Text style={styles.value}>
              {uploadedDocsCount} {uploadedDocsCount === 1 ? "File" : "Files"} Verified
            </Text>
          )}
        </View>
      </View>

      {/* 2. Tax Computation Card / CA Informative Banner (Omitted for Nil Return) */}
      {!isNilReturn && calculationMethod !== "manual_estimates" && (
        <View style={styles.caBannerCard}>
          <View style={styles.caBannerHeaderRow}>
            <View style={styles.caBannerLeft}>
              <Ionicons name="information-circle-outline" size={20} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.caBannerTitle}>Tax Computation</Text>
            </View>
            {renderEditButton(onEditTaxComputation || onEditFilingDetails)}
          </View>
          <Text style={styles.caBannerText}>
            Finsolz CA will calculate your liabilities, ITC, and net payable tax directly from your uploaded invoices.
          </Text>
        </View>
      )}

      {!isNilReturn && calculationMethod === "manual_estimates" && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Tax Computation</Text>
            {renderEditButton(onEditTaxComputation || onEditFilingDetails)}
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Gross Taxable Turnover</Text>
            <Text style={styles.value}>{formatInr(currentTurnover)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Estimated Taxable Purchases</Text>
            <Text style={styles.value}>{formatInr(currentPurchases)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Output GST (18%)</Text>
            <Text style={styles.value}>{formatInr(outputGst)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Eligible Input Tax Credit (ITC)</Text>
            <Text style={[styles.value, styles.valueSuccess]}>- {formatInr(currentItc)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Net Tax Liability (Govt)</Text>
            <Text style={styles.value}>{formatInr(netLiability)}</Text>
          </View>
        </View>
      )}

      {/* 3. Documents Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Documents</Text>
        </View>
        <View style={styles.divider} />

        {isNilReturn ? (
          <View style={styles.allDocsUploadedBox}>
            <Ionicons name="checkmark-circle" size={22} color="#059669" />
            <View style={styles.flex1Col}>
              <Text style={styles.allDocsUploadedTitle}>
                No Documents Required
              </Text>
              <Text style={styles.allDocsUploadedSub}>
                Nil Return filings do not require financial records or invoice uploads.
              </Text>
            </View>
          </View>
        ) : missingDocsCount > 0 ? (
          <View style={styles.missingDocsRow}>
            <View style={styles.missingAlertBox}>
              <Ionicons name="warning-outline" size={24} color="#E11D48" style={styles.alertIconTopMargin} />
              <View style={styles.flex1Col}>
                <Text style={styles.missingAlertTitle}>
                  {missingDocsCount} {missingDocsCount === 1 ? "Document" : "Documents"} Missing
                </Text>
                <Text style={styles.missingAlertSub}>
                  Please upload all 12 required documents to proceed with filing.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.reuploadBtn}
              activeOpacity={0.8}
              onPress={onReuploadDocuments || onEditDocuments}
            >
              <Ionicons name="cloud-upload-outline" size={17} color={BrandColors.PRIMARY_ORANGE} />
              <Text style={styles.reuploadBtnText}>Upload Here</Text>
              <Ionicons name="chevron-forward" size={13} color={BrandColors.PRIMARY_ORANGE} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.allDocsUploadedBox}>
            <Ionicons name="checkmark-circle" size={22} color="#059669" />
            <View style={styles.flex1Col}>
              <Text style={styles.allDocsUploadedTitle}>
                All Required Documents Uploaded
              </Text>
              <Text style={styles.allDocsUploadedSub}>
                {uploadedDocsCount} {uploadedDocsCount === 1 ? "document" : "documents"} verified and ready for CA computation.
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default GstFilingReviewStep;
