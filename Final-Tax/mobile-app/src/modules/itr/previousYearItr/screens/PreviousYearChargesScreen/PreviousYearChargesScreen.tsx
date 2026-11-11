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
import { LateFilingHeaderBanner } from "../../components/charges/LateFilingHeaderBanner";
import { GovernmentChargesCard } from "../../components/charges/GovernmentChargesCard";
import { ServiceFeeCard } from "../../components/charges/ServiceFeeCard";
import { ChargesEstimateWarningBanner } from "../../components/charges/ChargesEstimateWarningBanner";
import { DEFAULT_PREVIOUS_YEAR_CHARGES } from "../../mock/chargesData";
import { useApplicationStore } from "@/store/applicationStore";
import { styles } from "./PreviousYearChargesScreen.styles";
import {
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "@/shared/utils/screenInsets";

export const PreviousYearChargesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createApplication = useApplicationStore((state) => state.createApplication);
  const params = useLocalSearchParams<{
    assessmentYear?: string;
  }>();

  const assessmentYear =
    params.assessmentYear || DEFAULT_PREVIOUS_YEAR_CHARGES.assessmentYear;

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    const createdAppId = createApplication(
      "previous-year-itr",
      `Previous Year ITR - ${assessmentYear}`,
      "ITR",
      {
        assessmentYear,
        governmentCharges: DEFAULT_PREVIOUS_YEAR_CHARGES.governmentCharges,
        serviceFee: DEFAULT_PREVIOUS_YEAR_CHARGES.serviceFee,
      },
      [
        `Form 16 / Form 16A (${assessmentYear})`,
        `Form 26AS (${assessmentYear})`,
        `Bank Statement (${assessmentYear})`,
      ],
      DEFAULT_PREVIOUS_YEAR_CHARGES.serviceFee.totalServiceFee,
      "Paid"
    );

    router.push({
      pathname: "/service/previous-year-success" as any,
      params: {
        applicationId: createdAppId,
        assessmentYear: assessmentYear,
      },
    });
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={{ width: 38, height: 38 }} />

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Previous Year ITR</Text>
          <Text style={styles.headerSubtitle}>Fees & Charges</Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Notice Banner */}
        <LateFilingHeaderBanner />

        {/* 2 Side-by-Side Summary Cards */}
        <View style={styles.cardsRow}>
          <GovernmentChargesCard
            charges={DEFAULT_PREVIOUS_YEAR_CHARGES.governmentCharges}
          />
          <ServiceFeeCard
            serviceFee={DEFAULT_PREVIOUS_YEAR_CHARGES.serviceFee}
          />
        </View>

        {/* Warning Notice Card */}
        <ChargesEstimateWarningBanner assessmentYear={assessmentYear} />
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviousYearChargesScreen;
