import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PreviousYearHeader } from "../../components/PreviousYearHeader";
import { AssessmentYearSelector } from "../../components/AssessmentYearSelector";
import { ContinueButton } from "../../components/ContinueButton";
import { ASSESSMENT_YEARS } from "../../mock/assessmentYearsData";
import { useApplicationStore } from "@/store/applicationStore";
import { styles } from "./PreviousYearSelectionScreen.styles";
import {
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "@/shared/utils/screenInsets";

export const PreviousYearSelectionScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const savePreviousYearDraft = useApplicationStore((state) => state.savePreviousYearDraft);
  const previousYearDraft = useApplicationStore((state) => state.previousYearDraft);

  // AY 2023-24 is selected by default as in the design specification
  const [selectedYearId, setSelectedYearId] = useState<string>(() => {
    return previousYearDraft?.formData?.selectedYearId || "ay-2023-24";
  });

  useEffect(() => {
    if (previousYearDraft) {
      if (previousYearDraft.formData?.selectedYearId) {
        setSelectedYearId(previousYearDraft.formData.selectedYearId);
      }
      if (previousYearDraft.step === 3) {
        router.push({
          pathname: "/service/previous-year-documents" as any,
          params: { assessmentYear: previousYearDraft.assessmentYear || "AY 2023–24" },
        });
      } else if (previousYearDraft.step === 2) {
        router.push({
          pathname: "/service/previous-year-charges" as any,
          params: { assessmentYear: previousYearDraft.assessmentYear || "AY 2023–24" },
        });
      } else if (previousYearDraft.step === 1) {
        router.push({
          pathname: "/service/previous-year-itr-details" as any,
          params: { assessmentYear: previousYearDraft.assessmentYear || "AY 2023–24" },
        });
      }
    }
  }, []);

  const selectedItem = ASSESSMENT_YEARS.find((y) => y.id === selectedYearId);
  const isEligibleSelected = !!selectedItem && selectedItem.isEligible;

  const handleSelectYear = (id: string) => {
    setSelectedYearId(id);
  };

  const handleContinue = () => {
    if (!isEligibleSelected) return;

    const ay = selectedItem?.year || "AY 2023–24";
    savePreviousYearDraft({
      step: 1,
      assessmentYear: ay,
      formData: { selectedYearId, assessmentYear: ay },
    });

    router.push({
      pathname: "/service/previous-year-itr-details" as any,
      params: {
        assessmentYear: ay,
      },
    });
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <PreviousYearHeader />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AssessmentYearSelector
          items={ASSESSMENT_YEARS}
          selectedId={selectedYearId}
          onSelectYear={handleSelectYear}
        />
      </ScrollView>

      {/* Sticky Bottom Continue Button */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <ContinueButton
          onPress={handleContinue}
          disabled={!isEligibleSelected}
        />
      </View>
    </View>
  );
};

export default PreviousYearSelectionScreen;
