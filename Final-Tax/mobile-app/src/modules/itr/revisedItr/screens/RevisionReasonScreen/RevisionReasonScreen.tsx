import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRevisedProgressStore } from "../../store/revisedProgressStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RevisedItrApiService } from "../../services/RevisedItrApiService";
import { RevisedItrHeader } from "../../components/common";
import { RevisionReasonCard } from "../../components/reason";
import { REVISION_REASONS } from "../../mock/revisedItrData";
import { RevisionReasonId } from "../../types/revisedItr.types";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
} from "./RevisionReasonScreen.styles";

export const RevisionReasonScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const storedReason = useRevisedProgressStore((s) => s.revisionReason);
  const setRevisionReason = useRevisedProgressStore((s) => s.setRevisionReason);
  const setDocuments = useRevisedProgressStore((s) => s.setDocuments);
  const setFormData = useRevisedProgressStore((s) => s.setFormData);

  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    isEditing?: string;
  }>();

  // "missed_income" is selected by default matching the reference screenshot
  const [selectedReason, setSelectedReason] =
    useState<RevisionReasonId>((storedReason as RevisionReasonId) || "missed_income");
  const [otherReasonText, setOtherReasonText] = useState("");
  const [otherError, setOtherError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { revisedItrId, revisionReasonId, setBackendIds, setMaxStepReached } = useRevisedProgressStore();

  const mapReasonToEnum = (id: string) => {
    if (id === "incorrect_bank") return "INCORRECT_BANK_DETAILS";
    return id.toUpperCase();
  };

  // POST Method - Normal Flow (Continue)
  const handleContinue = async () => {
    if (selectedReason === "other" && !otherReasonText.trim()) {
      setOtherError("Please specify the reason for revision.");
      return;
    }

    setOtherError(null);

    if (selectedReason !== storedReason) {
      setDocuments(null);
      setFormData({});
      setRevisionReason(selectedReason);
    }

    if (!revisedItrId) {
      Alert.alert("Error", "Missing revised ITR ID. Please start from Step 1.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        revisedItrId: revisedItrId,
        reason: mapReasonToEnum(selectedReason),
        otherReason: selectedReason === "other" ? otherReasonText : undefined
      };

      const response = await RevisedItrApiService.saveRevisionReason(payload);
      if (response && response.revisionReasonId) {
        setBackendIds({ revisionReasonId: response.revisionReasonId });
      }
      setMaxStepReached(3);

      // Navigate to Screen 3: Update Changed Details
      router.push({
        pathname: "/service/revised-itr-update" as any,
        params: {
          acknowledgementNumber: params.acknowledgementNumber,
          assessmentYear: params.assessmentYear || "AY 2025–26",
          revisionReason: selectedReason,
          otherReasonText: selectedReason === "other" ? otherReasonText : undefined,
        },
      });
    } catch (e) {
      console.error("Error saving revision reason:", e);
      Alert.alert("Error", "Failed to save revision reason.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PUT Method - Editing Flow (Update & Continue)
  const handleUpdateAndContinue = async () => {
    if (selectedReason === "other" && !otherReasonText.trim()) {
      setOtherError("Please specify the reason for revision.");
      return;
    }

    setOtherError(null);

    if (selectedReason !== storedReason) {
      setDocuments(null);
      setFormData({});
      setRevisionReason(selectedReason);
    }

    if (!revisionReasonId) {
      Alert.alert("Error", "No revision reason ID found to update.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        revisedItrId: revisedItrId,
        reason: mapReasonToEnum(selectedReason),
        otherReason: selectedReason === "other" ? otherReasonText : undefined
      };

      await RevisedItrApiService.updateRevisionReason(revisionReasonId, payload);

      // Redirect back to Review screen
      router.push({
        pathname: "/service/revised-itr-review" as any,
        params: {
          acknowledgementNumber: params.acknowledgementNumber,
          assessmentYear: params.assessmentYear || "AY 2025–26",
          revisionReason: selectedReason,
          otherReasonText: selectedReason === "other" ? otherReasonText : undefined,
        },
      });
    } catch (e) {
      console.error("Error updating revision reason:", e);
      Alert.alert("Error", "Failed to update revision reason.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <RevisedItrHeader subtitle="Reason for Revision" currentStep={2} totalSteps={5} />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Choose Reason for Revision</Text>
          <Text style={styles.pageSubtitle}>
            Select the primary reason for revising your filed return.
          </Text>
        </View>

        {/* Reason Cards List */}
        {REVISION_REASONS.map((reason) => (
          <RevisionReasonCard
            key={reason.id}
            item={reason}
            isSelected={selectedReason === reason.id}
            onSelect={(id) => {
              setSelectedReason(id);
              if (otherError) setOtherError(null);
            }}
          />
        ))}

        {/* Free Text Input if "Other Reason" Selected */}
        {selectedReason === "other" && (
          <View style={styles.otherInputGroup}>
            <Text style={styles.otherInputLabel}>
              Specify your reason for revision <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.otherTextInput,
                otherError ? styles.inputError : null,
              ]}
              placeholder="Enter description"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={otherReasonText}
              onChangeText={(val) => {
                setOtherReasonText(val);
                if (otherError) setOtherError(null);
              }}
            />
            {otherError ? (
              <Text style={styles.errorText}>{otherError}</Text>
            ) : null}
          </View>
        )}

        {/* Action Button — In Scroll Flow */}
        <View style={styles.buttonWrapper}>
          {params.isEditing === "true" ? (
            /* Separate Button 1: Update & Continue (PUT Method) */
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdateAndContinue}
              style={styles.continueButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Update & Continue</Text>
              )}
            </TouchableOpacity>
          ) : (
            /* Separate Button 2: Continue (POST Method) */
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={styles.continueButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RevisionReasonScreen;

