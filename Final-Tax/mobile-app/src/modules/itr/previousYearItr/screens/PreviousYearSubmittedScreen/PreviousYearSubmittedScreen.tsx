import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PreviousYearSuccessCard } from "../../components/submission/PreviousYearSuccessCard";
import { PreviousYearStepperTimeline } from "../../components/submission/PreviousYearStepperTimeline";
import { PreviousYearStatusInfoCard } from "../../components/submission/PreviousYearStatusInfoCard";
import { WhatHappensNextInfoCard } from "../../components/submission/WhatHappensNextInfoCard";
import { PreviousYearSubmissionDetails } from "../../types/submission.types";
import { styles } from "./PreviousYearSubmittedScreen.styles";
import {
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "@/shared/utils/screenInsets";

export const PreviousYearSubmittedScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    applicationId?: string;
    assessmentYear?: string;
  }>();

  const applicationId = params.applicationId || "Pending";
  const assessmentYear = params.assessmentYear || "";

  const details: PreviousYearSubmissionDetails = {
    applicationId,
    applicationStatus: "Under Verification",
    assessmentYear,
    assignedTo: "Tax Executive",
    estimatedProcessingTime: "3–5 Working Days",
    notificationMethod: "SMS & Email",
  };

  const handleBack = () => {
    router.replace("/(main)/home" as any);
  };

  const handleGoHome = () => {
    router.replace("/(main)/home" as any);
  };

  const handleTrackStatus = () => {
    if (applicationId && applicationId !== "Pending" && !applicationId.includes(" ")) {
      router.replace(`/application/${applicationId}` as any);
    } else {
      router.replace("/(main)/applications" as any);
    }
  };

  React.useEffect(() => {
    const { BackHandler } = require("react-native");
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Previous Year ITR</Text>
          <Text style={styles.headerSubtitle}>Application Submitted</Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Card with Green Checkmark & Application ID */}
        <PreviousYearSuccessCard applicationId={applicationId} />

        {/* 5-Stage Stepper Timeline */}
        <PreviousYearStepperTimeline />

        {/* Status Information Card */}
        <PreviousYearStatusInfoCard details={details} />

        {/* What Happens Next Information Card */}
        <WhatHappensNextInfoCard />
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTrackStatus}
          style={styles.trackButton}
        >
          <Text style={styles.trackButtonText}>Track Application Status</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGoHome}
          style={[
            styles.trackButton,
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 1.5,
              borderColor: "#CBD5E1",
              marginTop: 8,
            },
          ]}
        >
          <Ionicons name="home-outline" size={18} color="#0B1F3A" style={{ marginRight: 6 }} />
          <Text style={[styles.trackButtonText, { color: "#0B1F3A" }]}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviousYearSubmittedScreen;
