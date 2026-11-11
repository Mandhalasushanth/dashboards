import React, { useEffect } from "react";
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
  NoticeTimelineTracker,
  NoticeFilingDetailsCard,
} from "../../components/status";
import {
  MOCK_NOTICE_STATUS_DETAILS,
} from "../../mock/taxNoticeData";
import { NoticeTrackingStep } from "../../types/taxNotice.types";
import { useApplicationStore } from "@/store/applicationStore";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./NoticeStatusScreen.styles";

export const NoticeStatusScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    applicationId?: string;
    noticeNumber?: string;
    assessmentYear?: string;
    pan?: string;
  }>();

  const clearTaxNoticeDraft = useApplicationStore((state) => state.clearTaxNoticeDraft);

  // Clear notice draft upon successful submission
  useEffect(() => {
    clearTaxNoticeDraft();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const fullLifecycleSteps: NoticeTrackingStep[] = [
    {
      id: "step-1",
      title: "Notice & Details Provided",
      date: params.assessmentYear || "AY 2025–26",
      description: "Notice details and primary document submitted",
      status: "completed",
    },
    {
      id: "step-2",
      title: "Staff Review & Verification",
      date: "Verified",
      description: "Tax Executive examined notice & supporting documents",
      status: "completed",
    },
    {
      id: "step-3",
      title: "Response Drafted & Approved",
      date: "Approved",
      description: "Legal draft confirmed and signed off by assessee",
      status: "completed",
    },
    {
      id: "step-4",
      title: "Response Submitted",
      date: todayStr,
      description: "Response successfully filed on Income Tax e-filing portal",
      status: "completed",
    },
    {
      id: "step-5",
      title: "Department Resolution",
      date: "Pending",
      description: "Awaiting final intimation or closure order from CPC / AO",
      status: "pending",
    },
  ];

  const ackNumber = `RSP${Date.now().toString().slice(-8)}`;

  const details = {
    ...MOCK_NOTICE_STATUS_DETAILS,
    noticeNumber: params.noticeNumber?.trim() || MOCK_NOTICE_STATUS_DETAILS.noticeNumber || "Notice Response",
    submittedOn: todayStr,
    acknowledgementNo: params.applicationId || ackNumber,
    currentStatus: "Response Submitted",
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      "Download Acknowledgement",
      `Filing Acknowledgement Receipt #${ackNumber} has been generated. Would you like to view it?`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "View Receipt",
          onPress: () => Alert.alert("Receipt", "Your official e-filing acknowledgement is stored in Documents."),
        },
      ]
    );
  };

  const handleBackToServices = () => {
    router.replace("/service/itr" as any);
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <TaxNoticeHeader subtitle="Notice Status" />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Success Illustration */}
        <View style={styles.successSection}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>
            Response Submitted Successfully
          </Text>
          <Text style={styles.successSubtitle}>
            Your response has been submitted to the Income Tax Department. We will
            keep you updated on any further communication.
          </Text>
        </View>

        {/* Vertical Stepper Timeline */}
        <NoticeTimelineTracker steps={fullLifecycleSteps} />

        {/* Structured Details Card */}
        <NoticeFilingDetailsCard details={details} />

        {/* Download Acknowledgement Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDownloadReceipt}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#EFF6FF",
            borderWidth: 1,
            borderColor: "#BFDBFE",
            borderRadius: 14,
            paddingVertical: 12,
            marginBottom: 14,
            gap: 8,
          }}
        >
          <Ionicons name="download-outline" size={18} color="#2563EB" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1D4ED8" }}>
            Download Filing Acknowledgement
          </Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="information" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.infoText}>
            We’ll notify you whenever there is an update from the Income Tax
            Department.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBackToServices}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back to Tax Services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NoticeStatusScreen;

