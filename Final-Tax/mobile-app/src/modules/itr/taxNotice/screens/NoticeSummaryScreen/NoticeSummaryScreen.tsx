import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TaxNoticeHeader } from "../../components/common";
import {
  NoticeMetadataCard,
  NoticeExplanationCard,
} from "../../components/summary";
import { MOCK_NOTICE_SUMMARY } from "../../mock/taxNoticeData";
import { TaxNoticeSummaryData } from "../../types/taxNotice.types";
import { parseStringToDate } from "../../components/common/TaxNoticeDatePickerInput";
import { useApplicationStore } from "@/store/applicationStore";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./NoticeSummaryScreen.styles";

export const NoticeSummaryScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    pan?: string;
    noticeNumber?: string;
    noticeDate?: string;
    responseDueDate?: string;
    noticeType?: string;
    assessmentYear?: string;
    customerExplanation?: string;
    noticeFileName?: string;
  }>();

  const taxNoticeDraft = useApplicationStore((state) => state.taxNoticeDraft);
  const saveTaxNoticeDraft = useApplicationStore((state) => state.saveTaxNoticeDraft);

  const draftData = taxNoticeDraft?.formData || {};

  const noticeNumber = params.noticeNumber || draftData.noticeNumber || "CPC/2526/A3/284419260";
  const noticeDate = params.noticeDate || draftData.noticeDate || "18 Aug 2026";
  const responseDueDate = params.responseDueDate || draftData.responseDueDate || "17 Sep 2026";
  const assessmentYear = params.assessmentYear || draftData.assessmentYear || "AY 2025–26";
  const noticeTypeRaw = params.noticeType || draftData.noticeType || "Proposed Adjustment";
  const pan = params.pan || draftData.pan || "";

  // Extract section code from notice type string (e.g. "Section 143(1)(a) - ..." -> "143(1)(a)")
  const sectionMatch = noticeTypeRaw.match(/143\(1\)\(a\)|139\(9\)|142\(1\)|148|156|245/i);
  const section = sectionMatch ? sectionMatch[0] : "143(1)(a)";
  const noticeTypeDisplay = noticeTypeRaw.includes("-")
    ? noticeTypeRaw.split("-")[1].trim()
    : noticeTypeRaw;

  // Calculate days left
  const calculateDaysLeft = (dueStr: string): number => {
    try {
      const due = parseStringToDate(dueStr);
      if (!due) return 0;
      const diff = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 15;
    }
  };

  const dynamicSummary: TaxNoticeSummaryData = {
    noticeType: noticeTypeDisplay || MOCK_NOTICE_SUMMARY.noticeType,
    section: section,
    issuedDate: noticeDate,
    responseDueDate: responseDueDate,
    daysLeft: calculateDaysLeft(responseDueDate),
    riskLevel: "Low",
    whatItMeans:
      draftData.customerExplanation
        ? `Notice received for ${assessmentYear} regarding ${noticeTypeDisplay}. The department's records require clarification regarding your income returns and supporting documentation.`
        : MOCK_NOTICE_SUMMARY.whatItMeans,
    actionRequired:
      "You need to confirm whether the reported items were accounted for, provide relevant proofs (AIS, Form 16, bank statements), and approve the legal response prepared by our Tax Executive.",
  };

  const handleContinue = () => {
    // Navigate to Screen 4: Additional Documents Required & Customer Upload
    router.push({
      pathname: "/service/tax-notice-documents" as any,
      params: {
        pan,
        noticeNumber,
        noticeDate,
        responseDueDate,
        assessmentYear,
        noticeType: noticeTypeRaw,
      },
    });
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <TaxNoticeHeader
        subtitle="Notice Summary"
        onSaveDraft={() => {
          saveTaxNoticeDraft({
            formData: {
              pan,
              noticeNumber,
              noticeDate,
              responseDueDate,
              noticeType: noticeTypeRaw,
              assessmentYear,
            },
            step: "SUMMARY",
            updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
          Alert.alert("Draft Saved", "Your notice progress has been saved as a draft.");
        }}
      />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Here’s what this notice means</Text>
          <Text style={styles.pageSubtitle}>
            A plain-language explanation from your Tax Executive — no jargon.
          </Text>
        </View>

        {/* Notice Metadata Card */}
        <NoticeMetadataCard summary={dynamicSummary} />

        {/* Explanation Card 1: What this notice means */}
        <NoticeExplanationCard
          iconName="document-text-outline"
          title="What this notice means"
          description={dynamicSummary.whatItMeans}
        />

        {/* Explanation Card 2: What action is required */}
        <NoticeExplanationCard
          iconName="checkmark-circle-outline"
          title="What action is required"
          description={dynamicSummary.actionRequired}
        />

        {/* Staff Review Callout: Additional Documents Required */}
        <View
          style={{
            backgroundColor: "#F0FDF4",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#BBF7D0",
            padding: 14,
            marginTop: 4,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#22C55E",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              marginTop: 2,
            }}
          >
            <Ionicons name="documents-outline" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#166534",
                marginBottom: 4,
              }}
            >
              Additional Documents Required
            </Text>
            <Text style={{ fontSize: 12.5, color: "#15803D", lineHeight: 18 }}>
              To prepare a strong legal reply, our Tax Executive requires supporting documents including your previous ITR, Form 16, AIS, and bank statements in the next step.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View
        style={[
          styles.bottomBar,
          getBottomBarInsetsStyle(insets.bottom),
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>Upload Supporting Documents</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NoticeSummaryScreen;

