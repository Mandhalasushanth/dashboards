import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRevisedProgressStore } from "../../store/revisedProgressStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevisedItrHeader, RevisedItrAckInfoIcon } from "../../components/common";
import { GstSelectModal } from "@/modules/gst/components/common/GstSelectModal";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { RevisedItrApiService } from "../../services/RevisedItrApiService";
import { getPastAssessmentYears } from "@/modules/itr/taxRules";
import {
  filterNumericAcknowledgementNumber,
  isOriginalItrAckNumberValid,
} from "../../utils/acknowledgementValidation";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
} from "./FindOriginalReturnScreen.styles";

export const FindOriginalReturnScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    isEditing?: string;
  }>();
  useRevisedProgressStore((s) => s.maxStepReached);
  const insets = useSafeAreaInsets();

  const initialAck = filterNumericAcknowledgementNumber(params.acknowledgementNumber || "");
  const [ackNumber, setAckNumber] = useState<string>(initialAck);
  const ayOptions = getPastAssessmentYears(3).map((ay) => ay.label);
  const [assessmentYear, setAssessmentYear] = useState<string>(
    params.assessmentYear || ""
  );
  const [showAyModal, setShowAyModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(() => {
    if (params.acknowledgementNumber) {
      if (initialAck.length === 0) {
        return "Please enter the 15-digit Acknowledgement Number.";
      }
      if (initialAck.length < 15) {
        return "Acknowledgement number must be exactly 15 digits.";
      }
      return null;
    }
    return null;
  });
  const [ayError, setAyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Clear store state from earlier completed sessions when starting afresh
    if (params.isEditing !== "true" && !params.acknowledgementNumber) {
      useRevisedProgressStore.getState().reset();
    }
  }, [params.isEditing, params.acknowledgementNumber]);

  const handleAckNumberChange = (val: string) => {
    // Real-time numeric filtering: reject letters, emojis, spaces, commas, and special characters
    const filtered = filterNumericAcknowledgementNumber(val);
    setAckNumber(filtered);

    // Clear error once 15 digits are reached
    if (error && filtered.length === 15) {
      setError(null);
    }
  };

  const handleAckNumberBlur = () => {
    // Validate on blur when user leaves the field
    if (ackNumber.length > 0 && ackNumber.length < 15) {
      setError("Acknowledgement number must be exactly 15 digits.");
    } else if (ackNumber.length === 15) {
      setError(null);
    }
  };

  const handleOpenAyModal = () => {
    Keyboard.dismiss();
    if (ackNumber.length > 0 && ackNumber.length < 15) {
      setError("Acknowledgement number must be exactly 15 digits.");
    }
    setShowAyModal(true);
  };

  const isAckValid = isOriginalItrAckNumberValid(ackNumber);
  const isAySelected = assessmentYear.trim().length > 0;
  const isContinueDisabled = !isAckValid || !isAySelected || isSubmitting;

  const { revisedItrId, setBackendIds, setMaxStepReached } = useRevisedProgressStore();
  const { customer, authenticatedUser } = useAuthStore();

  // POST Method - Normal Flow (Continue)
  const handleContinue = async () => {
    const cleanAck = filterNumericAcknowledgementNumber(ackNumber);
    if (cleanAck.length !== 15) {
      setError(
        cleanAck.length === 0
          ? "Please enter the 15-digit Acknowledgement Number."
          : "Acknowledgement number must be exactly 15 digits."
      );
      return;
    }

    if (!assessmentYear.trim()) {
      setAyError("Please select the Assessment Year.");
      return;
    }

    try {
      setIsSubmitting(true);
      const customerId =
        customer?.customerId ||
        (authenticatedUser as any)?.customerId ||
        (authenticatedUser as any)?.custId ||
        "";
      if (!customerId) {
        Alert.alert(
          "Registration Required",
          "Please complete your account registration before filing a revised ITR.",
        );
        return;
      }

      const payload = {
        customerId,
        itrAcknowledgementNumber: cleanAck,
        assessmentYear: assessmentYear.replace("AY ", "").trim(),
      };

      const response = await RevisedItrApiService.saveRevisedItr(payload);
      if (response && response.revisedItrId) {
        setBackendIds({ revisedItrId: response.revisedItrId });
      }
      setMaxStepReached(2);

      // Navigate to Screen 2: Reason for Revision
      router.push({
        pathname: "/service/revised-itr-reason" as any,
        params: {
          acknowledgementNumber: cleanAck,
          assessmentYear,
        },
      });
    } catch (e: any) {
      console.error("Error saving revised ITR:", e);
      Alert.alert("Error", e?.message || "Failed to save revised ITR.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PUT Method - Editing Flow (Update & Continue)
  const handleUpdateAndContinue = async () => {
    const cleanAck = filterNumericAcknowledgementNumber(ackNumber);
    if (cleanAck.length !== 15) {
      setError(
        cleanAck.length === 0
          ? "Please enter the 15-digit Acknowledgement Number."
          : "Acknowledgement number must be exactly 15 digits."
      );
      return;
    }

    if (!assessmentYear.trim()) {
      setAyError("Please select the Assessment Year.");
      return;
    }

    if (!revisedItrId) {
      Alert.alert("Error", "No revised ITR ID found to update.");
      return;
    }

    try {
      setIsSubmitting(true);
      const customerId =
        customer?.customerId ||
        (authenticatedUser as any)?.customerId ||
        (authenticatedUser as any)?.custId ||
        "";
      if (!customerId) {
        Alert.alert(
          "Registration Required",
          "Please complete your account registration before filing a revised ITR.",
        );
        return;
      }

      const payload = {
        customerId,
        itrAcknowledgementNumber: cleanAck,
        assessmentYear: assessmentYear.replace("AY ", "").trim(),
      };

      await RevisedItrApiService.updateRevisedItr(revisedItrId, payload);

      // Redirect back to Review screen
      router.push({
        pathname: "/service/revised-itr-review" as any,
        params: {
          acknowledgementNumber: cleanAck,
          assessmentYear,
        },
      });
    } catch (e: any) {
      console.error("Error updating revised ITR:", e);
      Alert.alert("Error", e?.message || "Failed to update revised ITR.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header with Step Indicator */}
      <RevisedItrHeader subtitle="Find Original Return" currentStep={1} totalSteps={5} />

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
          <Text style={styles.pageTitle}>Find Original Return</Text>
          <Text style={styles.pageSubtitle}>
            Verify your previous return filing details to start the revision.
          </Text>
        </View>

        {/* Single Merged Card: Original Return Details & Assessment Year */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="document-text-outline" size={18} color="#083B75" />
              <Text style={styles.cardTitle}>Original Return Details</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            Enter the 15-digit acknowledgement number from your previously filed ITR-V and select the assessment year.
          </Text>

          {/* Field 1: Acknowledgement Number */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabelInline}>
                Original ITR Acknowledgement Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              <RevisedItrAckInfoIcon style={styles.infoIconSpacing} />
            </View>
            <TextInput
              style={[styles.textInput, error ? styles.inputError : null]}
              placeholder="Enter 15-digit acknowledgement number"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={15}
              autoCapitalize="none"
              autoCorrect={false}
              value={ackNumber}
              onChangeText={handleAckNumberChange}
              onBlur={handleAckNumberBlur}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.fieldSpacer} />

          {/* Field 2: Assessment Year Bottom-Sheet Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Assessment Year <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenAyModal}
              style={[styles.dropdownSelector, ayError ? styles.inputError : null]}
            >
              <Text
                style={
                  assessmentYear ? styles.dropdownValue : styles.dropdownPlaceholder
                }
              >
                {assessmentYear || "Select Assessment Year"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#0B1F3A"
              />
            </TouchableOpacity>
            {ayError ? <Text style={styles.errorText}>{ayError}</Text> : null}
          </View>
        </View>

        {/* Action Button — In Scroll Flow (Bottom of Screen via auto margin) */}
        <View style={styles.buttonWrapper}>
          {params.isEditing === "true" ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdateAndContinue}
              style={[styles.ctaButton, isContinueDisabled ? styles.ctaButtonDisabled : null]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    style={[
                      styles.ctaButtonText,
                      isContinueDisabled ? styles.ctaButtonTextDisabled : null,
                    ]}
                  >
                    Update & Continue
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={isContinueDisabled ? "#64748B" : "#FFFFFF"}
                  />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={[styles.ctaButton, isContinueDisabled ? styles.ctaButtonDisabled : null]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    style={[
                      styles.ctaButtonText,
                      isContinueDisabled ? styles.ctaButtonTextDisabled : null,
                    ]}
                  >
                    Continue
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={isContinueDisabled ? "#64748B" : "#FFFFFF"}
                  />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Assessment Year Modal — Bottom Sheet UI Matching GST Filing */}
      <GstSelectModal
        visible={showAyModal}
        title="Select Assessment Year"
        options={ayOptions}
        selectedValue={assessmentYear}
        onSelect={(val) => {
          setAssessmentYear(val);
          setShowAyModal(false);
          setAyError(null);
        }}
        onClose={() => setShowAyModal(false)}
      />
    </View>
  );
};

export default FindOriginalReturnScreen;
